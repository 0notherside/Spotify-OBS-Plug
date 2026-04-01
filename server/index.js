import os from "node:os";
import "./load-env.js";
import { createApp } from "./app.js";
import { config } from "./config.js";

function firstLanIPv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      const v4 = net.family === "IPv4" || net.family === 4;
      if (v4 && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

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
  console.log(`Spotify OBS overlay server (${config.host})`);
  console.log(`  This PC:    ${base}/`);
  console.log(`  Overlay:    ${base}/overlay/?safe=1`);
  if (config.host === "0.0.0.0") {
    const lan = firstLanIPv4();
    if (lan) {
      console.log(`  Other PC (OBS Browser URL): http://${lan}:${config.port}/overlay/?safe=1`);
      console.log(`  (Server PC must stay on; same Wi‑Fi/LAN as the gaming PC.)`);
    }
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
          : `  To listen on your LAN (another PC’s OBS), set HOST=0.0.0.0 in .env\n`)
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
