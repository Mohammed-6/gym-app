import { api } from "@/lib/api";
import { ImportMembersResult } from "./types";

export async function importMembers(members: Record<string, unknown>[], branch?: string) {
  const { data } = await api.post<{ data: ImportMembersResult }>("/members/import", {
    members,
    branch,
  });
  return data.data;
}
