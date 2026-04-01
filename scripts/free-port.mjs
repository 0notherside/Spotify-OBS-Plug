#!/usr/bin/env node
/**
 * Stops whatever is listening on PORT (default 3847) so `npm start` can bind.
 * macOS / Linux: uses lsof. Run from project root: node scripts/free-port.mjs
 */
import { execSync } from "node:child_process";

const port = process.env.PORT || "3847";

try {
  const out = execSync(`lsof -ti :${port}`, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  const pids = out
    .trim()
    .split(/\s+/)
    .map((s) => Number.parseInt(s, 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
      console.log(`[free-port] Sent SIGTERM to PID ${pid} on port ${port}`);
    } catch {
      /* ignore */
    }
  }
} catch {
  /* nothing listening — ok */
}
