import { z } from "zod";

export const checkInSchema = z.object({
  member: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid member id"),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
