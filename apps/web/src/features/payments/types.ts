import { PaymentMethod, PaymentPurpose } from "@gym-app/shared";

export interface Payment {
  _id: string;
  member: { _id: string; memberId: string; firstName: string; lastName?: string; phone: string } | string;
  membership: string | null;
  branch: string;
  purpose: PaymentPurpose;
  membershipAmount: number;
  otherFees: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  notes?: string;
  receivedBy: { _id: string; name: string } | string;
  receiptNumber: string;
  createdAt: string;
}

export interface CreatePaymentInput {
  member: string;
  membership?: string | null;
  purpose?: PaymentPurpose;
  membershipAmount: number;
  otherFees?: number;
  discount?: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ListPaymentsParams {
  page?: number;
  member?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
}
