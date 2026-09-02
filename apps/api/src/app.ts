import path from "path";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import routes from "./routes";

const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

// Hardcoded so it's always allowed regardless of the deployed CORS_ORIGIN env var.
const HARDCODED_ORIGINS = ["https://gym-app-web-1098266546452.asia-south1.run.app"];

const allowedOrigins = [...HARDCODED_ORIGINS, ...env.corsOrigin.split(",").map((origin) => origin.trim())];

function isOriginAllowed(origin: string): boolean {
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  // In development, Next.js picks whatever port is free (3000, 3001, 3002, ...),
  // so pin to a single origin in production but stay flexible locally.
  return env.nodeEnv !== "production" && LOCALHOST_ORIGIN.test(origin);
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin "${origin}" is not allowed by CORS`));
        }
      },
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "OK" });
  });

  // Only ever populated by the local-disk photo storage fallback (dev only, when
  // GCP_STORAGE_BUCKET isn't set) — production photos are served from GCS signed URLs instead.
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
