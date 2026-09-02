import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const bootstrapAdminSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type BootstrapAdminInput = z.infer<typeof bootstrapAdminSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
