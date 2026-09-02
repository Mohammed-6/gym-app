import { Schema, model } from "mongoose";

// Singleton document — there is only ever one settings row, at a fixed _id.
export const SETTINGS_ID = "app";

export interface SettingsDocument {
  _id: string;
  /** Prefix used when auto-generating member IDs (e.g. "MEM" -> "MEM-000001"). Empty means plain numbers, no separator. */
  memberIdPrefix: string;
  updatedAt: Date;
}

const settingsSchema = new Schema<SettingsDocument>(
  {
    _id: { type: String },
    memberIdPrefix: { type: String, default: "MEM", trim: true },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const Settings = model<SettingsDocument>("Settings", settingsSchema);
