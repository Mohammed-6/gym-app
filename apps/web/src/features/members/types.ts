import { Gender, MemberStatus, MembershipStatus } from "@gym-app/shared";

export interface Member {
  _id: string;
  memberId: string;
  branch: { _id: string; name: string } | string;
  firstName: string;
  lastName?: string;
  fatherName?: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gender?: Gender;
  dateOfBirth?: string;
  batch?: string;
  weight?: number;
  chest?: number;
  arm?: number;
  notes?: string;
  status: MemberStatus;
  hasPhoto: boolean;
  createdAt: string;
  updatedAt: string;
  /** Most recent membership regardless of status — check `status` before assuming it's active. */
  latestMembership?: {
    plan: { _id: string; name: string } | string;
    startDate: string;
    endDate: string;
    status: MembershipStatus;
    finalAmount: number;
  } | null;
  lastPayment?: {
    paidAmount: number;
    paymentDate: string;
  } | null;
}

export interface MemberInput {
  memberId?: string;
  firstName: string;
  lastName?: string;
  fatherName?: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gender?: Gender;
  dateOfBirth?: string;
  batch?: string;
  weight?: number;
  chest?: number;
  arm?: number;
  notes?: string;
  status?: MemberStatus;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListMembersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}
