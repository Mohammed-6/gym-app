import { api } from "@/lib/api";
import { StaffUser, StaffUserInput } from "./types";

export async function listUsers() {
  const { data } = await api.get<{ data: StaffUser[] }>("/users");
  return data.data;
}

export async function createUser(input: StaffUserInput) {
  const { data } = await api.post<{ data: StaffUser }>("/users", input);
  return data.data;
}

export async function updateUser(id: string, input: Partial<StaffUserInput>) {
  const { data } = await api.patch<{ data: StaffUser }>(`/users/${id}`, input);
  return data.data;
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${id}`);
}
