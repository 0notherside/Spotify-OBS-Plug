import express from "express";
import path from "node:path";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";

export function createApp() {
  const app = express();

  app.use(express.static(path.join(config.rootDir, "public")));

  app.use("/auth", authRoutes);
  app.use("/api", apiRoutes);

  return app;
}
