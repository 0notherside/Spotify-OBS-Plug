/**
 * URL query: scale, theme, accent (hex without #), poll (ms)
 */
const params = new URLSearchParams(window.location.search);

const scale = Math.min(2.5, Math.max(0.5, parseFloat(params.get("scale") || "1") || 1));
const theme = (params.get("theme") || "spotify").toLowerCase();
const accent = (params.get("accent") || "").replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
const pollMs = Math.min(10000, Math.max(500, parseInt(params.get("poll") || "1100", 10) || 1100));
/** OBS Browser Source: disable backdrop blur (often broken on transparent pages). Add ?safe=1 to URL */
const safe = params.get("safe") === "1";

const themes = {
  spotify: {
    accent: "#1db954",
    glassTint: "rgba(18, 28, 22, 0.45)",
    highlight: "rgba(255, 255, 255, 0.14)",
    text: "rgba(255, 255, 255, 0.96)",
    muted: "rgba(255, 255, 255, 0.58)",
  },
  dark: {
    accent: "#818cf8",
    glassTint: "rgba(16, 18, 32, 0.5)",
    highlight: "rgba(255, 255, 255, 0.12)",
    text: "rgba(255, 255, 255, 0.95)",
    muted: "rgba(255, 255, 255, 0.55)",
  },
  midnight: {
    accent: "#38bdf8",
    glassTint: "rgba(12, 20, 36, 0.48)",
    highlight: "rgba(255, 255, 255, 0.15)",
    text: "rgba(255, 255, 255, 0.96)",
    muted: "rgba(255, 255, 255, 0.58)",
  },
  light: {
    accent: "#007aff",
    glassTint: "rgba(255, 255, 255, 0.55)",
    highlight: "rgba(255, 255, 255, 0.85)",
    text: "rgba(15, 15, 25, 0.92)",
    muted: "rgba(15, 15, 25, 0.55)",
  },
};

const base = themes[theme] || themes.spotify;
const accentColor = accent.length === 6 ? `#${accent}` : base.accent;

const root = document.documentElement;
root.style.setProperty("--ui-scale", String(scale));
root.style.setProperty("--accent", accentColor);
root.style.setProperty("--glass-tint", base.glassTint);
root.style.setProperty("--glass-highlight", base.highlight);
root.style.setProperty("--text-primary", base.text);
root.style.setProperty("--text-muted", base.muted);

if (theme === "light") {
  document.body.classList.add("theme-light");
}

if (safe) {
  document.documentElement.classList.add("obs-safe");
}

export const overlayParams = {
  scale,
  theme,
  accent: accentColor,
  pollMs,
  safe,
};
