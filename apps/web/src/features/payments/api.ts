import { api } from "@/lib/api";
import { Receipt } from "@/features/receipts/types";
import { CreatePaymentInput, ListPaymentsParams, PaginatedResponse, Payment } from "./types";

export async function listPayments(params: ListPaymentsParams) {
  const { data } = await api.get<{ data: PaginatedResponse<Payment> }>("/payments", { params });
  return data.data;
}

export async function getPayment(id: string) {
  const { data } = await api.get<{ data: Payment }>(`/payments/${id}`);
  return data.data;
}

export async function createPayment(input: CreatePaymentInput) {
  const { data } = await api.post<{ data: { payment: Payment; receipt: Receipt } }>("/payments", input);
  return data.data;
}
