import { describe, expect, it } from "vitest";
import { calculatePaymentTotals } from "../modules/payments/payment.calculations";

describe("calculatePaymentTotals", () => {
  it("matches the spec example: 1500 + 300 - 0 = 1800 total, paid 1600 -> due 200", () => {
    const totals = calculatePaymentTotals({
      membershipAmount: 1500,
      otherFees: 300,
      discount: 0,
      paidAmount: 1600,
    });

    expect(totals.totalAmount).toBe(1800);
    expect(totals.dueAmount).toBe(200);
  });

  it("applies a discount before computing the total", () => {
    const totals = calculatePaymentTotals({
      membershipAmount: 1500,
      otherFees: 0,
      discount: 200,
      paidAmount: 1300,
    });

    expect(totals.totalAmount).toBe(1300);
    expect(totals.dueAmount).toBe(0);
  });

  it("defaults otherFees and discount to zero when omitted", () => {
    const totals = calculatePaymentTotals({ membershipAmount: 1000, paidAmount: 1000 });
    expect(totals.totalAmount).toBe(1000);
    expect(totals.dueAmount).toBe(0);
  });

  it("never returns a negative due amount when overpaid", () => {
    const totals = calculatePaymentTotals({ membershipAmount: 1000, paidAmount: 1500 });
    expect(totals.dueAmount).toBe(0);
  });

  it("never returns a negative total when discount exceeds fees", () => {
    const totals = calculatePaymentTotals({ membershipAmount: 100, discount: 500, paidAmount: 0 });
    expect(totals.totalAmount).toBe(0);
  });
});
