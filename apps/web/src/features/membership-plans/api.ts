import { api } from "@/lib/api";
import { MembershipPlan, MembershipPlanInput } from "./types";

export async function listMembershipPlans() {
  const { data } = await api.get<{ data: MembershipPlan[] }>("/membership-plans");
  return data.data;
}

export async function createMembershipPlan(input: MembershipPlanInput) {
  const { data } = await api.post<{ data: MembershipPlan }>("/membership-plans", input);
  return data.data;
}

export async function updateMembershipPlan(id: string, input: Partial<MembershipPlanInput>) {
  const { data } = await api.patch<{ data: MembershipPlan }>(`/membership-plans/${id}`, input);
  return data.data;
}

export async function deleteMembershipPlan(id: string) {
  await api.delete(`/membership-plans/${id}`);
}
