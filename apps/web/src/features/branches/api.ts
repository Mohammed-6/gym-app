import { api } from "@/lib/api";
import { Branch, BranchInput } from "./types";

export async function listBranches() {
  const { data } = await api.get<{ data: Branch[] }>("/branches");
  return data.data;
}

export async function createBranch(input: BranchInput) {
  const { data } = await api.post<{ data: Branch }>("/branches", input);
  return data.data;
}

export async function updateBranch(id: string, input: BranchInput) {
  const { data } = await api.patch<{ data: Branch }>(`/branches/${id}`, input);
  return data.data;
}

export async function deleteBranch(id: string) {
  await api.delete(`/branches/${id}`);
}
