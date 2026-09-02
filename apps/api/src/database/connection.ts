import mongoose from "mongoose";
import { env } from "../config/env";

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 5000 });
  } catch (error) {
    console.error(
      `\n[database] Could not connect to MongoDB at "${env.mongodbUri}".\n` +
        "  - Is MongoDB running? On Windows: `net start MongoDB` (or check Services for \"MongoDB\").\n" +
        "  - Is MONGODB_URI in your .env correct?\n" +
        "  - Verify manually with: mongosh " +
        `"${env.mongodbUri}"\n`
    );
    throw error;
  }

  console.log(`[database] connected to ${mongoose.connection.name}`);

  mongoose.connection.on("disconnected", () => {
    console.error("[database] lost connection to MongoDB");
  });
  mongoose.connection.on("error", (error) => {
    console.error("[database] connection error:", error.message);
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
