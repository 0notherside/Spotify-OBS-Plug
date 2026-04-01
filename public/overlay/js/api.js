export async function fetchNowPlaying() {
  const res = await fetch("/api/now-playing", { cache: "no-store" });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    return {
      ok: false,
      error: data.error || "unauthorized",
      message: data.message || "Sign in required.",
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: data.error || "error",
      message: data.message || `HTTP ${res.status}`,
    };
  }

  return data;
}
