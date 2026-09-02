import fs from "fs/promises";
import path from "path";
import { env } from "../../config/env";
import { PhotoStorage } from "./photo-storage";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

/**
 * Dev-only fallback used automatically when GCP_STORAGE_BUCKET isn't configured, so the
 * capture → resize → overwrite → view flow can be exercised without real GCP credentials.
 * Photos are served back through GET /uploads/<key>, mounted as static files in app.ts.
 */
export function createLocalPhotoStorage(): PhotoStorage {
  return {
    async upload(key, buffer) {
      const filePath = path.join(UPLOADS_DIR, key);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, buffer);
    },

    async getViewUrl(key) {
      // Local dev only, so an absolute localhost URL is fine — the frontend runs on a
      // different origin/port and needs a full URL, not a path relative to itself.
      // Cache-bust so re-capturing a photo doesn't serve a stale browser-cached image.
      return `http://localhost:${env.port}/uploads/${key}?v=${Date.now()}`;
    },

    async delete(key) {
      await fs.rm(path.join(UPLOADS_DIR, key), { force: true });
    },
  };
}
