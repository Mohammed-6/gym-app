import { api } from "@/lib/api";
import { DashboardSummary } from "./types";

export async function getDashboardSummary() {
  const { data } = await api.get<{ data: DashboardSummary }>("/dashboard");
  return data.data;
}
