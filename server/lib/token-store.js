import fs from "node:fs/promises";
import path from "node:path";

/**
 * Persists Spotify tokens to disk so restarts keep the session.
 */
export async function readTokens(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    if (
      typeof data.access_token !== "string" ||
      typeof data.refresh_token !== "string"
    ) {
      return null;
    }
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at:
        typeof data.expires_at === "number" ? data.expires_at : 0,
    };
  } catch {
    return null;
  }
}

export async function writeTokens(filePath, tokens) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(tokens, null, 2), "utf8");
}

export async function clearTokens(filePath) {
  try {
    await fs.unlink(filePath);
  } catch {
    /* ignore */
  }
}
