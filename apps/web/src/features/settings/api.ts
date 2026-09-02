import { api } from "@/lib/api";
import { Settings, UpdateSettingsInput } from "./types";

export async function getSettings() {
  const { data } = await api.get<{ data: Settings }>("/settings");
  return data.data;
}

export async function updateSettings(input: UpdateSettingsInput) {
  const { data } = await api.patch<{ data: Settings }>("/settings", input);
  return data.data;
}
