import os from "node:os";

/** First non-internal IPv4 (for “OBS on another device” links). */
export function firstLanIPv4() {
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
