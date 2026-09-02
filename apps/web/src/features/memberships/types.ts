import { MembershipStatus } from "@gym-app/shared";

export interface Membership {
  _id: string;
  member: { _id: string; memberId: string; firstName: string; lastName?: string } | string;
  plan: { _id: string; name: string; durationInMonths: number; price: number } | string;
  branch: string;
  startDate: string;
  endDate: string;
  price: number;
  discount: number;
  finalAmount: number;
  status: MembershipStatus;
  createdAt: string;
}

export interface CreateMembershipInput {
  member: string;
  plan: string;
  discount?: number;
  startDate?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
