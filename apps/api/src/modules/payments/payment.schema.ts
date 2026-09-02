import { z } from "zod";
import { PAYMENT_METHODS, PAYMENT_PURPOSES } from "@gym-app/shared";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createPaymentSchema = z.object({
  member: z.string().regex(objectIdRegex, "Invalid member id"),
  membership: z.string().regex(objectIdRegex, "Invalid membership id").nullable().optional(),
  purpose: z.enum(PAYMENT_PURPOSES).optional(),
  membershipAmount: z.coerce.number().min(0),
  otherFees: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).optional(),
  paidAmount: z.coerce.number().min(0.01, "Paid amount must be greater than zero"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paymentDate: z.coerce.date().optional(),
  notes: z.string().trim().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
