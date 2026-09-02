import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string().trim().min(1, "Branch name is required"),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const updateBranchSchema = createBranchSchema.partial();

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
