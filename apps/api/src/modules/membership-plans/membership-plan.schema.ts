import { z } from "zod";

export const createMembershipPlanSchema = z.object({
  name: z.string().trim().min(1, "Plan name is required"),
  durationInMonths: z.coerce.number().int().min(1, "Duration must be at least 1 month"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const updateMembershipPlanSchema = createMembershipPlanSchema.partial();

export type CreateMembershipPlanInput = z.infer<typeof createMembershipPlanSchema>;
export type UpdateMembershipPlanInput = z.infer<typeof updateMembershipPlanSchema>;
