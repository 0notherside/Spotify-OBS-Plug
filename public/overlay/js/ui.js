function formatTime(ms) {
  if (!Number.isFinite(ms) || ms < 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function createUi(elements) {
  const {
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
  } = elements;

  let lastTrackId = null;

  function setState(state) {
    widget.dataset.state = state;
  }

  function showError(msg) {
    badgeError.hidden = false;
    badgeError.textContent = msg;
    trackName.textContent = "Connection issue";
    artistName.textContent = "Check the dashboard";
    coverImg.hidden = true;
    coverPh.style.display = "flex";
    setState("error");
  }

  function hideError() {
    badgeError.hidden = true;
  }

  function applyTrack(item, playing, paused) {
    const id = item?.id || null;
    if (id && id !== lastTrackId) {
      lastTrackId = id;
      titlesAnimate();
    }
    if (!id) {
      lastTrackId = null;
    }

    if (item?.image) {
      coverImg.src = item.image;
      coverImg.hidden = false;
      coverPh.style.display = "none";
    } else {
      coverImg.hidden = true;
      coverPh.style.display = "flex";
    }

    trackName.textContent = item?.name || "Nothing playing";
    artistName.textContent = item?.artists?.length
      ? item.artists.join(", ")
      : "Start playback on Spotify";

    badgePaused.hidden = !paused;
    hideError();

    if (!item) {
      setState("idle");
    } else {
      setState(playing ? "playing" : paused ? "paused" : "idle");
    }

    const dur = item?.durationMs ?? 0;
    timeTotal.textContent = formatTime(dur);
    progressEl.setAttribute("aria-valuemax", String(Math.max(1, dur)));
  }

  function titlesAnimate() {
    const el = document.getElementById("titles");
    if (!el) return;
    el.classList.remove("titles--flash");
    void el.offsetWidth;
    el.classList.add("titles--flash");
  }

  function setProgressDisplay(progressMs, durationMs, playing) {
    const pct = durationMs > 0 ? Math.min(100, (progressMs / durationMs) * 100) : 0;
    progressFill.style.width = `${pct}%`;
    progressGlow.style.width = `${pct}%`;
    timeCurrent.textContent = formatTime(progressMs);
    progressEl.setAttribute("aria-valuenow", String(Math.round(pct)));
    if (!playing) {
      timeTotal.textContent = formatTime(durationMs);
    }
  }

  return {
    setState,
    showError,
    hideError,
    applyTrack,
    setProgressDisplay,
    formatTime,
  };
}
