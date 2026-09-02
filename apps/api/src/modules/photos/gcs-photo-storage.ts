import { Storage } from "@google-cloud/storage";
import { env } from "../../config/env";
import { PhotoStorage } from "./photo-storage";

const SIGNED_URL_TTL_MS = 15 * 60 * 1000;

export function createGcsPhotoStorage(): PhotoStorage {
  const bucketName = env.gcs.bucket;
  if (!bucketName) {
    throw new Error("GCP_STORAGE_BUCKET is not set");
  }

  const storage = new Storage({
    projectId: env.gcs.projectId,
    // GOOGLE_APPLICATION_CREDENTIALS (a file path) is picked up automatically by the SDK.
    // GCP_SERVICE_ACCOUNT_KEY is an alternative for hosts where writing a key file is awkward.
    ...(env.gcs.credentialsJson ? { credentials: JSON.parse(env.gcs.credentialsJson) } : {}),
  });
  const bucket = storage.bucket(bucketName);

  return {
    async upload(key, buffer, contentType) {
      const file = bucket.file(key);
      await file.save(buffer, { contentType, resumable: false });
    },

    async getViewUrl(key) {
      const file = bucket.file(key);
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + SIGNED_URL_TTL_MS,
      });
      return url;
    },

    async delete(key) {
      await bucket.file(key).delete({ ignoreNotFound: true });
    },
  };
}
