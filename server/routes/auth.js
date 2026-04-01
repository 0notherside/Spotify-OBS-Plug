import crypto from "node:crypto";
import express from "express";
import { config, assertConfig } from "../config.js";
import { exchangeCodeForTokens, getAuthorizeUrl } from "../lib/spotify-auth.js";
import { writeTokens } from "../lib/token-store.js";

const router = express.Router();

/** In-memory OAuth state (short-lived). */
const oauthStates = new Map();

function cleanupStates() {
  const cutoff = Date.now() - 10 * 60_000;
  for (const [k, v] of oauthStates) {
    if (v < cutoff) oauthStates.delete(k);
  }
}

router.get("/login", (req, res) => {
  try {
    assertConfig();
  } catch (e) {
    return res.status(500).send(`<pre>${e.message}</pre>`);
  }
  cleanupStates();
  const state = crypto.randomBytes(16).toString("hex");
  oauthStates.set(state, Date.now());
  res.redirect(getAuthorizeUrl(state));
});

router.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;
  if (error) {
    return res.status(400).send(`Spotify authorization error: ${error}`);
  }
  if (!code || typeof code !== "string") {
    return res.status(400).send("Missing authorization code.");
  }
  if (!state || !oauthStates.has(state)) {
    return res.status(400).send("Invalid or expired OAuth state. Try /auth/login again.");
  }
  oauthStates.delete(state);

  try {
    assertConfig();
    const tokenResponse = await exchangeCodeForTokens(code);
    const expiresIn = tokenResponse.expires_in ?? 3600;
    const expires_at = Date.now() + expiresIn * 1000;
    await writeTokens(config.tokenPath, {
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_at,
    });
  } catch (e) {
    return res.status(500).send(`<pre>Token exchange failed:\n${e.message}</pre>`);
  }

  res.redirect("/?connected=1");
});

export default router;
