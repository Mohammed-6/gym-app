import { peekNextSequenceValue, setNextSequenceValue } from "../sequences/sequence.service";
import { SETTINGS_ID, Settings } from "./settings.model";
import { UpdateSettingsInput } from "./settings.schema";

export interface SettingsView {
  memberIdPrefix: string;
  /** The number that will be used the next time a member id is auto-generated. */
  nextMemberNumber: number;
  updatedAt: Date;
}

async function loadSettingsDoc() {
  return Settings.findByIdAndUpdate(SETTINGS_ID, {}, { new: true, upsert: true, setDefaultsOnInsert: true });
}

export async function getSettings(): Promise<SettingsView> {
  const [settings, nextMemberNumber] = await Promise.all([
    loadSettingsDoc(),
    peekNextSequenceValue("member"),
  ]);
  return { memberIdPrefix: settings.memberIdPrefix, nextMemberNumber, updatedAt: settings.updatedAt };
}

export async function updateSettings(input: UpdateSettingsInput): Promise<SettingsView> {
  const { nextMemberNumber, ...docFields } = input;

  const tasks: Promise<unknown>[] = [];
  if (Object.keys(docFields).length > 0) {
    tasks.push(
      Settings.findByIdAndUpdate(
        SETTINGS_ID,
        { $set: docFields },
        { upsert: true, setDefaultsOnInsert: true, runValidators: true }
      )
    );
  }
  if (nextMemberNumber !== undefined) {
    tasks.push(setNextSequenceValue("member", nextMemberNumber));
  }
  await Promise.all(tasks);

  return getSettings();
}

export async function getMemberIdPrefix(): Promise<string> {
  const settings = await loadSettingsDoc();
  return settings.memberIdPrefix ?? "";
}
