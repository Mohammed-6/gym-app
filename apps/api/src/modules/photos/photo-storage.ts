export interface PhotoStorage {
  /** Uploads (overwriting any existing object at the same key). */
  upload(key: string, buffer: Buffer, contentType: string): Promise<void>;
  /** A short-lived URL the browser can load the image from directly. */
  getViewUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}
