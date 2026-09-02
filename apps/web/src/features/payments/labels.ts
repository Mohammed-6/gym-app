import { PaymentMethod, PaymentPurpose } from "@gym-app/shared";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card",
  bank_transfer: "Bank Transfer",
  other: "Other",
};

export const paymentPurposeLabels: Record<PaymentPurpose, string> = {
  membership: "Membership Fee",
  due_settlement: "Previous Due",
  advance: "Advance Payment",
  other: "Other / Extra",
};
