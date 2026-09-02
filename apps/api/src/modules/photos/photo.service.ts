import sharp from "sharp";
import { env } from "../../config/env";
import { createGcsPhotoStorage } from "./gcs-photo-storage";
import { createLocalPhotoStorage } from "./local-photo-storage";
import { PhotoStorage } from "./photo-storage";

const PHOTO_SIZE = 200;

let storage: PhotoStorage | undefined;

function getPhotoStorage(): PhotoStorage {
  if (!storage) {
    if (env.gcs.bucket) {
      storage = createGcsPhotoStorage();
    } else {
      console.warn(
        "[photos] GCP_STORAGE_BUCKET is not set — saving member/branch photos to local disk (./uploads) for development only."
      );
      storage = createLocalPhotoStorage();
    }
  }
  return storage;
}

export async function uploadEntityPhoto(key: string, buffer: Buffer): Promise<void> {
  const resized = await sharp(buffer)
    .rotate() // respect the camera's EXIF orientation before cropping
    .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: "cover", position: "attention" })
    .jpeg({ quality: 85 })
    .toBuffer();

  await getPhotoStorage().upload(key, resized, "image/jpeg");
}

export async function getEntityPhotoViewUrl(key: string): Promise<string> {
  return getPhotoStorage().getViewUrl(key);
}

export async function deleteEntityPhoto(key: string): Promise<void> {
  await getPhotoStorage().delete(key);
}
