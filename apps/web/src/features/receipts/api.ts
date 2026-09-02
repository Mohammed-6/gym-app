import { api } from "@/lib/api";
import { PaginatedResponse, Receipt } from "./types";

export async function listReceipts(params: { page?: number; search?: string }) {
  const { data } = await api.get<{ data: PaginatedResponse<Receipt> }>("/receipts", { params });
  return data.data;
}

export async function getReceipt(id: string) {
  const { data } = await api.get<{ data: Receipt }>(`/receipts/${id}`);
  return data.data;
}

export async function getReceiptByPayment(paymentId: string) {
  const { data } = await api.get<{ data: Receipt }>(`/receipts/by-payment/${paymentId}`);
  return data.data;
}
