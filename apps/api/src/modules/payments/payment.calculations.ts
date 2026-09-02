export interface PaymentTotalsInput {
  membershipAmount: number;
  otherFees?: number;
  discount?: number;
  paidAmount: number;
}

export interface PaymentTotals {
  otherFees: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
}

export function calculatePaymentTotals(input: PaymentTotalsInput): PaymentTotals {
  const otherFees = input.otherFees ?? 0;
  const discount = input.discount ?? 0;
  const totalAmount = Math.max(0, input.membershipAmount + otherFees - discount);
  const dueAmount = Math.max(0, totalAmount - input.paidAmount);

  return { otherFees, discount, totalAmount, paidAmount: input.paidAmount, dueAmount };
}
