const statusLine = document.getElementById("status-line");
const overlayLocalEl = document.getElementById("overlay-local");
const overlayLanEl = document.getElementById("overlay-lan");
const copyLocalBtn = document.getElementById("copy-local");
const copyLanBtn = document.getElementById("copy-lan");
const lanWrap = document.getElementById("lan-wrap");
const lanLocked = document.getElementById("lan-locked");
const portHint = document.getElementById("port-hint");

function wireCopy(btn, getText) {
  btn?.addEventListener("click", async () => {
    const text = getText();
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "Copied";
      setTimeout(() => {
        btn.textContent = "Copy";
      }, 1600);
    } catch {
      btn.textContent = "Copy failed";
    }
  });
}

wireCopy(copyLocalBtn, () => overlayLocalEl?.textContent || "");
wireCopy(copyLanBtn, () => overlayLanEl?.textContent || "");

async function loadUrls() {
  try {
    const res = await fetch("/api/urls");
    const data = await res.json();
    if (!res.ok) throw new Error("bad response");

    overlayLocalEl.textContent = data.localhostOverlay;
    if (portHint && data.port) portHint.textContent = String(data.port);

    if (data.bind === "0.0.0.0" && data.lanOverlay) {
      overlayLanEl.textContent = data.lanOverlay;
      lanWrap.hidden = false;
      lanLocked.hidden = true;
    } else if (data.bind === "127.0.0.1" || data.bind === "localhost") {
      lanWrap.hidden = true;
      lanLocked.hidden = false;
    } else {
      lanWrap.hidden = true;
      lanLocked.hidden = true;
    }
  } catch {
    const origin = window.location.origin;
    overlayLocalEl.textContent = `${origin}/overlay/?safe=1`;
    lanWrap.hidden = true;
    lanLocked.hidden = false;
  }
}

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

loadUrls();
refreshStatus();
