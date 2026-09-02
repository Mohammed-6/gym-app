import { describe, expect, it } from "vitest";
import { createMemberSchema } from "../modules/members/member.schema";
import { createMembershipPlanSchema } from "../modules/membership-plans/membership-plan.schema";
import { createPaymentSchema } from "../modules/payments/payment.schema";
import { loginSchema } from "../modules/auth/auth.schema";

describe("createMemberSchema", () => {
  it("requires a first name", () => {
    const result = createMemberSchema.safeParse({ phone: "9876543210" });
    expect(result.success).toBe(false);
  });

  it("requires a phone number", () => {
    const result = createMemberSchema.safeParse({ firstName: "Asha" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email but allows an empty one", () => {
    expect(
      createMemberSchema.safeParse({ firstName: "Asha", phone: "9876543210", email: "not-an-email" }).success
    ).toBe(false);
    expect(createMemberSchema.safeParse({ firstName: "Asha", phone: "9876543210", email: "" }).success).toBe(
      true
    );
  });

  it("rejects an invalid date of birth", () => {
    const result = createMemberSchema.safeParse({
      firstName: "Asha",
      phone: "9876543210",
      dateOfBirth: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a minimal valid member", () => {
    const result = createMemberSchema.safeParse({ firstName: "Asha", phone: "9876543210" });
    expect(result.success).toBe(true);
  });
});

describe("createMembershipPlanSchema", () => {
  it("rejects a negative price", () => {
    const result = createMembershipPlanSchema.safeParse({ name: "Monthly", durationInMonths: 1, price: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects a duration below 1 month", () => {
    const result = createMembershipPlanSchema.safeParse({ name: "Monthly", durationInMonths: 0, price: 1500 });
    expect(result.success).toBe(false);
  });

  it("accepts a valid plan", () => {
    const result = createMembershipPlanSchema.safeParse({ name: "Monthly", durationInMonths: 1, price: 1500 });
    expect(result.success).toBe(true);
  });
});

describe("createPaymentSchema", () => {
  it("rejects a zero or negative paid amount", () => {
    const base = { member: "a".repeat(24), membershipAmount: 1000, paymentMethod: "cash" };
    expect(createPaymentSchema.safeParse({ ...base, paidAmount: 0 }).success).toBe(false);
    expect(createPaymentSchema.safeParse({ ...base, paidAmount: -50 }).success).toBe(false);
  });

  it("rejects an invalid payment method", () => {
    const result = createPaymentSchema.safeParse({
      member: "a".repeat(24),
      membershipAmount: 1000,
      paidAmount: 1000,
      paymentMethod: "cheque",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid payment", () => {
    const result = createPaymentSchema.safeParse({
      member: "a".repeat(24),
      membershipAmount: 1000,
      paidAmount: 1000,
      paymentMethod: "cash",
    });
    expect(result.success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("requires a valid email and non-empty password", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "secret" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "admin@gym.local", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "admin@gym.local", password: "secret" }).success).toBe(true);
  });
});
