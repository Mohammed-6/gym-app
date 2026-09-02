import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createMembershipSchema = z.object({
  member: z.string().regex(objectIdRegex, "Invalid member id"),
  plan: z.string().regex(objectIdRegex, "Invalid plan id"),
  startDate: z.coerce.date().optional(),
  discount: z.coerce.number().min(0).optional(),
});

export const updateMembershipSchema = z.object({
  status: z.enum(["active", "expired", "cancelled"]).optional(),
});

export type CreateMembershipInput = z.infer<typeof createMembershipSchema>;
export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;
