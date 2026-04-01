import "./load-env.js";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { firstLanIPv4 } from "./lib/net-info.js";

if (!process.env.SPOTIFY_CLIENT_ID) {
  console.warn(
    "[spotify-obs-overlay] SPOTIFY_CLIENT_ID missing. Copy .env.example to .env and set credentials."
  );
} else if (!process.env.SPOTIFY_CLIENT_SECRET) {
  console.warn(
    "[spotify-obs-overlay] SPOTIFY_CLIENT_SECRET missing — add it from the Spotify Dashboard to sign in."
  );
}

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  const base = `http://127.0.0.1:${config.port}`;
  console.log(`Spotify OBS overlay server (bind: ${config.host})`);
  console.log(`  Dashboard:  ${base}/`);
  console.log(`  OBS (same PC): ${base}/overlay/?safe=1`);
  if (config.host === "0.0.0.0") {
    const lan = firstLanIPv4();
    if (lan) {
      console.log(`  OBS (other device on LAN): http://${lan}:${config.port}/overlay/?safe=1`);
    } else {
      console.log(`  (No LAN IPv4 found — connect Wi‑Fi/Ethernet to get a link for other devices.)`);
    }
    console.log(`  Lock to this Mac only: set HOST=127.0.0.1 in .env`);
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\n[spotify-obs-overlay] Port ${config.port} is already in use.\n` +
        `  Another app (or an old copy of this server) is listening.\n` +
        `  Fix: quit that process, or change PORT in .env, then run npm start again.\n` +
        `  macOS: lsof -i :${config.port}   then: kill <PID>\n` +
        (config.host === "0.0.0.0"
          ? ""
          : `  To allow OBS on another PC on Wi‑Fi, set HOST=0.0.0.0 in .env (default).\n`)
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
