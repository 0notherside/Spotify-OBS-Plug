import express from "express";
import { fetchCurrentlyPlaying } from "../lib/spotify-api.js";
import { getValidAccessToken } from "../lib/token-service.js";

const router = express.Router();

router.get("/now-playing", async (req, res) => {
  try {
    const tokenResult = await getValidAccessToken();
    if (!tokenResult.ok) {
      return res.status(401).json({
        ok: false,
        error: tokenResult.reason,
        message:
          tokenResult.reason === "no_session"
            ? "Not connected. Open the dashboard and sign in with Spotify."
            : "Session expired. Sign in again from the dashboard.",
      });
    }

    const data = await fetchCurrentlyPlaying(tokenResult.accessToken);
    return res.json({ ok: true, ...data });
  } catch (e) {
    if (e.code === "UNAUTHORIZED") {
      return res.status(401).json({
        ok: false,
        error: "unauthorized",
        message: "Access token rejected. Reconnect Spotify from the dashboard.",
      });
    }
    console.error("[api/now-playing]", e);
    return res.status(500).json({
      ok: false,
      error: "server_error",
      message: e.message || "Unknown error",
    });
  }
});

router.get("/status", async (req, res) => {
  const tokenResult = await getValidAccessToken();
  res.json({
    connected: tokenResult.ok,
    reason: tokenResult.ok ? undefined : tokenResult.reason,
  });
});

export default router;
