import { api } from "@/lib/api";
import { CreateMembershipInput, Membership, PaginatedResponse } from "./types";

export async function listMembershipsForMember(memberId: string) {
  const { data } = await api.get<{ data: PaginatedResponse<Membership> }>("/memberships", {
    params: { member: memberId, limit: 100 },
  });
  return data.data.items;
}

export async function createMembership(input: CreateMembershipInput) {
  const { data } = await api.post<{ data: Membership }>("/memberships", input);
  return data.data;
}

export async function cancelMembership(id: string) {
  const { data } = await api.patch<{ data: Membership }>(`/memberships/${id}`, { status: "cancelled" });
  return data.data;
}
