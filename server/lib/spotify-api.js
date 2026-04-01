const API = "https://api.spotify.com/v1";

/**
 * GET /me/player/currently-playing
 * Returns null if nothing playing (204), or normalized payload for the overlay.
 */
export async function fetchCurrentlyPlaying(accessToken) {
  const res = await fetch(`${API}/me/player/currently-playing`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 204) {
    return { playing: false, item: null };
  }

  if (res.status === 401) {
    const err = new Error("Unauthorized");
    err.code = "UNAUTHORIZED";
    throw err;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const raw = data.item;
  if (!raw) {
    return { playing: false, item: null };
  }

  let normalized;

  if (raw.type === "track") {
    const artists = (raw.artists || []).map((a) => a.name).filter(Boolean);
    const image =
      raw.album?.images?.sort((a, b) => (b.width || 0) - (a.width || 0))[0]
        ?.url || null;
    normalized = {
      id: raw.id,
      name: raw.name,
      artists,
      albumName: raw.album?.name || "",
      image,
      durationMs: raw.duration_ms ?? 0,
      progressMs: data.progress_ms ?? 0,
      uri: raw.uri,
      kind: "track",
    };
  } else if (raw.type === "episode") {
    const image =
      (raw.images || [])
        .slice()
        .sort((a, b) => (b.width || 0) - (a.width || 0))[0]?.url || null;
    const showName = raw.show?.name || "Podcast";
    normalized = {
      id: raw.id,
      name: raw.name,
      artists: [showName],
      albumName: showName,
      image,
      durationMs: raw.duration_ms ?? 0,
      progressMs: data.progress_ms ?? 0,
      uri: raw.uri,
      kind: "episode",
    };
  } else {
    return { playing: false, item: null, raw: data };
  }

  const isPlaying = data.is_playing === true;

  return {
    playing: isPlaying,
    paused: !isPlaying,
    item: normalized,
    timestamp: data.timestamp,
    serverTime: Date.now(),
  };
}
