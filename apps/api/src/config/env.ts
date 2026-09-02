import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: required("MONGODB_URI"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV ?? "development",
  gcs: {
    bucket: process.env.GCP_STORAGE_BUCKET,
    projectId: process.env.GCP_PROJECT_ID,
    credentialsJson: process.env.GCP_SERVICE_ACCOUNT_KEY,
    credentialsFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
};
