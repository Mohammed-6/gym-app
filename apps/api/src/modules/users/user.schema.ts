import { z } from "zod";
import { USER_ROLES } from "@gym-app/shared";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(USER_ROLES),
  branch: z
    .string()
    .regex(objectIdRegex, "Invalid branch id")
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
});

export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .partial()
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
