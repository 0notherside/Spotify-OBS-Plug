const statusLine = document.getElementById("status-line");
const overlayUrlEl = document.getElementById("overlay-url");
const copyBtn = document.getElementById("copy-btn");

const origin = window.location.origin;
const overlayUrl = `${origin}/overlay/`;

overlayUrlEl.textContent = overlayUrl;

async function refreshStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    if (data.connected) {
      statusLine.textContent = "Connected — Spotify session is active.";
      statusLine.className = "status ok";
    } else {
      statusLine.textContent =
        "Not connected — click below to authorize this app.";
      statusLine.className = "status warn";
    }
  } catch {
    statusLine.textContent = "Could not reach the API. Is the server running?";
    statusLine.className = "status warn";
  }
}

copyBtn?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(overlayUrl);
    copyBtn.textContent = "Copied";
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1600);
  } catch {
    copyBtn.textContent = "Copy failed";
  }
});

refreshStatus();
