import { config } from "../config.js";
import { readTokens, writeTokens } from "./token-store.js";
import { refreshAccessToken } from "./spotify-auth.js";

const BUFFER_MS = 60_000;

export async function getValidAccessToken() {
  let tokens = await readTokens(config.tokenPath);
  if (!tokens) return { ok: false, reason: "no_session" };

  const now = Date.now();
  if (tokens.expires_at && tokens.expires_at > now + BUFFER_MS) {
    return { ok: true, accessToken: tokens.access_token };
  }

  try {
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    const expiresIn = refreshed.expires_in ?? 3600;
    const expires_at = now + expiresIn * 1000;
    const next = {
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token ?? tokens.refresh_token,
      expires_at,
    };
    await writeTokens(config.tokenPath, next);
    return { ok: true, accessToken: next.access_token };
  } catch (e) {
    if (e.status === 400 || e.status === 401) {
      return { ok: false, reason: "refresh_failed", error: String(e.message) };
    }
    throw e;
  }
}
