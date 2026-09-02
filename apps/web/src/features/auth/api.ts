import { api } from "@/lib/api";
import { AuthUser, LoginResponse } from "./types";

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<{ data: LoginResponse }>("/auth/login", { email, password });
  return data.data;
}

export async function fetchCurrentUser() {
  const { data } = await api.get<{ data: AuthUser }>("/auth/me");
  return data.data;
}
