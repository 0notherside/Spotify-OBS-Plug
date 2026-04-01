import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

export const config = {
  rootDir,
  port: Number(process.env.PORT) || 3847,
  /** `0.0.0.0` = this machine + LAN (OBS on another PC). `127.0.0.1` = this machine only. */
  host: (process.env.HOST || "0.0.0.0").trim() || "0.0.0.0",
  clientId: process.env.SPOTIFY_CLIENT_ID || "",
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
  redirectUri: process.env.SPOTIFY_REDIRECT_URI || "http://127.0.0.1:3847/auth/callback",
  scopes: [
    "user-read-currently-playing",
    "user-read-playback-state",
  ].join(" "),
  tokenPath: path.join(rootDir, "data", "tokens.json"),
};

export function assertConfig() {
  const missing = [];
  if (!config.clientId?.trim()) missing.push("SPOTIFY_CLIENT_ID");
  if (!config.clientSecret?.trim()) missing.push("SPOTIFY_CLIENT_SECRET");
  if (missing.length) {
    throw new Error(
      `Missing ${missing.join(" and ")} in the project’s .env file (next to package.json). ` +
        `Copy .env.example to .env, paste your Spotify Client ID and Client Secret from ` +
        `https://developer.spotify.com/dashboard → your app → Settings, save the file, and restart the server (npm start).`
    );
  }
}
