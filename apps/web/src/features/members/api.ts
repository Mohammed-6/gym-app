import { api } from "@/lib/api";
import { ListMembersParams, Member, MemberInput, PaginatedResponse } from "./types";

export async function listMembers(params: ListMembersParams) {
  const { data } = await api.get<{ data: PaginatedResponse<Member> }>("/members", { params });
  return data.data;
}

export async function getMember(id: string) {
  const { data } = await api.get<{ data: Member }>(`/members/${id}`);
  return data.data;
}

export async function getNextMemberId() {
  const { data } = await api.get<{ data: { nextMemberId: string } }>("/members/next-id");
  return data.data.nextMemberId;
}

export async function createMember(input: MemberInput) {
  const { data } = await api.post<{ data: Member }>("/members", input);
  return data.data;
}

export async function updateMember(id: string, input: Partial<MemberInput>) {
  const { data } = await api.patch<{ data: Member }>(`/members/${id}`, input);
  return data.data;
}

export async function deleteMember(id: string) {
  await api.delete(`/members/${id}`);
}
