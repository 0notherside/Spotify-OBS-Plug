import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const envPath = path.join(rootDir, ".env");

const result = dotenv.config({ path: envPath });

if (result.error && result.error.code !== "ENOENT") {
  console.warn("[spotify-obs-overlay] Could not load .env:", result.error.message);
}
