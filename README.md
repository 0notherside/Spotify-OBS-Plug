# Spotify OBS Overlay

Local **Node.js + Express** server that connects to the **Spotify Web API** (OAuth Authorization Code flow), serves a **glass-style “Now Playing”** overlay, and updates in near real time for **OBS Studio** (Browser Source).

## Project layout

```
├── package.json
├── .env.example          # Copy to .env
├── README.md
├── server/
│   ├── index.js          # HTTP entry (binds 127.0.0.1)
│   ├── app.js            # Express app wiring
│   ├── config.js         # Env + paths
│   ├── lib/
│   │   ├── token-store.js    # Persist tokens under data/
│   │   ├── token-service.js  # Refresh access tokens
│   │   ├── spotify-auth.js   # OAuth helpers
│   │   └── spotify-api.js    # Currently-playing normalization
│   └── routes/
│       ├── auth.js         # /auth/login, /auth/callback
│       └── api.js          # /api/now-playing, /api/status
└── public/
    ├── index.html          # Dashboard (connect + copy overlay URL)
    ├── assets/             # Dashboard CSS/JS
    └── overlay/
        ├── index.html
        ├── css/overlay.css
        └── js/             # params, api, ui, main (ES modules)
```

## 1. Spotify API credentials

1. Open [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in.
2. **Create app** → name it (e.g. “OBS Overlay”), accept terms.
3. Open the app → **Settings**:
   - **Redirect URIs**: add exactly  
     `http://127.0.0.1:3847/auth/callback`  
     (must match `SPOTIFY_REDIRECT_URI` in `.env`).
   - Save.
4. Copy **Client ID** and **Client Secret** into `.env` (see below).

**Scopes used:** `user-read-currently-playing`, `user-read-playback-state`.

## 2. Configuration

```bash
cd "/path/to/Spotify OBS Plug"
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|----------|-------------|
| `SPOTIFY_CLIENT_ID` | From the dashboard |
| `SPOTIFY_CLIENT_SECRET` | From the dashboard |
| `SPOTIFY_REDIRECT_URI` | Default `http://127.0.0.1:3847/auth/callback` — must match dashboard |
| `PORT` | Default `3847` |

Tokens are stored in `data/tokens.json` (created automatically; listed in `.gitignore`).

## 3. Run locally

```bash
npm install
npm start
```

- **Dashboard:** [http://127.0.0.1:3847/](http://127.0.0.1:3847/) — click **Sign in with Spotify** once.
- **Overlay:** [http://127.0.0.1:3847/overlay/](http://127.0.0.1:3847/overlay/)

Development with auto-restart (Node 18+):

```bash
npm run dev
```

## 4. Add to OBS Studio

1. **Start the server** on the **same Mac** as OBS (`npm start` or `npm run start:clean`) and leave that terminal running.
2. **Sources** → **+** → **Browser** → name it (e.g. “Spotify Now Playing”).
3. **URL** — use the **overlay** path (not the dashboard):
   - `http://127.0.0.1:3847/overlay/?safe=1`  
   `safe=1` turns off heavy blur, which OBS’s browser often fails to draw on a **transparent** page (blank preview). You can try without `?safe=1` once you see the widget.
4. **Width** / **Height:** match your canvas (e.g. **1920** × **1080**). The widget is **centered** in that box.
5. Leave **Custom CSS** **empty** unless you know you need it.
6. Optional: **Refresh browser when scene becomes active**; turn **Shutdown source when not visible** off while testing so the preview always updates.
7. Position the source with **Edit Transform** if needed.

**If the preview is still blank:** confirm the URL opens in Safari/Chrome on the same machine while the server is running. If it works in the browser but not OBS, try **OBS → Settings → Advanced** and toggle **Enable Browser Source Hardware Acceleration**, then restart OBS.

**Note:** The server must be running while you stream.

### Two PCs: dev PC runs the server, gaming PC runs OBS

By default the app listens on **127.0.0.1**, so **only that computer** can open the overlay. **`http://127.0.0.1:3847` on the gaming PC is the gaming PC itself**, not your other machine — it will not show this project unless the server runs there too.

**What works:**

1. Run **`npm start` on the PC that should host the app** (often the same gaming PC for simplicity).
2. **Spotify login** (`/auth/login`) only needs to happen on a browser on a machine that can reach that server — usually the server PC at `http://127.0.0.1:3847/`.
3. To load the overlay **from another PC on the same network** (OBS on the gaming PC, Node on a second PC):
   - On the **server PC**, set in `.env`: **`HOST=0.0.0.0`** (listen on all interfaces), restart the server.
   - Allow **inbound TCP** on **`PORT`** (default **3847**) in that PC’s firewall.
   - On the **gaming PC**, set the Browser Source URL to **`http://<SERVER_PC_LAN_IP>:3847/overlay/?safe=1`** (the terminal prints a hint when `HOST=0.0.0.0`).
   - Both PCs must be on the **same LAN**; the server PC must stay on while you stream.

**Easiest setup:** install Node on the **gaming PC**, clone/copy the project, use `.env` there, run `npm start` on that PC, and use **`http://127.0.0.1:3847/overlay/?safe=1`** in OBS on the same machine — no LAN routing needed.

## 5. Overlay URL parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `scale` | `scale=1.25` | UI scale (0.5–2.5). |
| `theme` | `theme=midnight` | `spotify` (default), `dark`, `midnight`, `light`. |
| `accent` | `accent=ff0066` | Hex **without** `#` (overrides theme accent). |
| `poll` | `poll=1500` | Polling interval in ms (500–10000). |
| `safe` | `safe=1` | **Recommended for OBS:** disables backdrop blur so the panel stays visible in Browser Source. |

Example:

`http://127.0.0.1:3847/overlay/?safe=1&scale=1.2&theme=dark&poll=1200`

## 6. Behavior

- **Polling:** the overlay calls `GET /api/now-playing` on an interval; playback progress is **interpolated** between polls while music is playing for smoother bars.
- **Paused:** dimmed styling + **Paused** badge.
- **Nothing playing:** idle copy and placeholder artwork.
- **401 / expired session:** error badge — sign in again from the dashboard (`/auth/login` clears need for manual token edit if refresh fails; worst case delete `data/tokens.json` and reconnect).

## 7. Security notes

- With the default **`HOST=127.0.0.1`**, the server is only reachable on **this machine**.
- With **`HOST=0.0.0.0`**, any device on your **LAN** can open the dashboard and overlay — use only on **trusted home networks** (or add your own firewall rules).
- **Do not** commit `.env` or `data/tokens.json`.
- For production or remote access you would add HTTPS, secrets management, and a proper session model; this project is aimed at **local OBS** use.

## 8. Troubleshooting: browser says “can’t handle this request” / `EADDRINUSE`

- **`Error: listen EADDRINUSE … :3847`** — Something is already using port **3847** (often an old Node process). The new `npm start` then **exits**; the browser may hit a stuck process or nothing useful.
  - **Fix:** From the project folder run **`npm run start:clean`** (frees the port, then starts the server), **or** run `lsof -i :3847`, note the **PID**, then `kill <PID>`, then **`npm start`** again.
- **Use the exact URL:** **`http://127.0.0.1:3847/`** — not `https://`, and include **`:3847`**.
- After starting, the terminal should list the local URLs — if you don’t see that, the server did not start.

## License

MIT (project scaffold); Spotify is a trademark of Spotify AB.
