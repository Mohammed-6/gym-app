import { PaymentMethod, PaymentPurpose } from "@gym-app/shared";

export interface Receipt {
  _id: string;
  receiptNumber: string;
  payment: string;
  member: string;
  branch: { _id: string; name: string; address?: string; phone?: string } | string;
  purpose: PaymentPurpose;
  memberSnapshot: {
    memberId: string;
    name: string;
    fatherName?: string;
    phone: string;
    address?: string;
    batch?: string;
  };
  membershipFees: number;
  otherFees: number;
  discount: number;
  total: number;
  paid: number;
  due: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  receivedBy: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
