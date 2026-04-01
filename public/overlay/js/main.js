import { overlayParams } from "./params.js";
import { fetchNowPlaying } from "./api.js";
import { createUi } from "./ui.js";

const widget = document.getElementById("widget");
const coverImg = document.getElementById("cover-img");
const coverPh = document.getElementById("cover-ph");
const trackName = document.getElementById("track-name");
const artistName = document.getElementById("artist-name");
const progressEl = document.getElementById("progress");
const progressFill = document.getElementById("progress-fill");
const progressGlow = document.getElementById("progress-glow");
const timeCurrent = document.getElementById("time-current");
const timeTotal = document.getElementById("time-total");
const badgePaused = document.getElementById("badge-paused");
const badgeError = document.getElementById("badge-error");

coverImg.addEventListener("error", () => {
  coverImg.hidden = true;
  coverPh.style.display = "flex";
});

const ui = createUi({
  widget,
  coverImg,
  coverPh,
  trackName,
  artistName,
  progressEl,
  progressFill,
  progressGlow,
  timeCurrent,
  timeTotal,
  badgePaused,
  badgeError,
});

let lastPayload = null;
let pollTimer = null;
let raf = 0;
let localProgressBase = 0;
let localProgressAt = 0;
let playing = false;
let durationMs = 0;

function stopRaf() {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
}

function syncLocalProgress(item, isPlaying, serverTime) {
  durationMs = item?.durationMs ?? 0;
  const progressMs = item?.progressMs ?? 0;
  playing = isPlaying && !!item;
  localProgressBase = progressMs;
  localProgressAt = serverTime || Date.now();
}

function currentProgressMs() {
  if (!playing || !lastPayload?.item) return localProgressBase;
  const delta = Date.now() - localProgressAt;
  return Math.min(durationMs, localProgressBase + delta);
}

function tick() {
  ui.setProgressDisplay(currentProgressMs(), durationMs, playing);
  raf = requestAnimationFrame(tick);
}

async function poll() {
  const data = await fetchNowPlaying();

  if (!data.ok) {
    stopRaf();
    ui.showError(data.message || "Could not load playback");
    lastPayload = null;
    return;
  }

  lastPayload = data;
  const item = data.item;
  const isPlaying = data.playing === true;
  const paused = data.paused === true;

  ui.applyTrack(item, isPlaying, paused && !!item);
  syncLocalProgress(item, isPlaying, data.serverTime);

  ui.setProgressDisplay(currentProgressMs(), durationMs, playing);

  if (isPlaying && item) {
    if (!raf) raf = requestAnimationFrame(tick);
  } else {
    stopRaf();
  }
}

function schedule() {
  clearInterval(pollTimer);
  pollTimer = setInterval(poll, overlayParams.pollMs);
}

poll();
schedule();
