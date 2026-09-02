import { z } from "zod";
import { GENDERS, MEMBER_STATUSES } from "@gym-app/shared";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createMemberSchema = z.object({
  branch: z.string().regex(objectIdRegex, "Invalid branch id").optional(),
  memberId: z.string().trim().min(1, "Member ID cannot be empty").optional(),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().optional(),
  fatherName: z.string().trim().optional(),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  alternatePhone: z.string().trim().optional(),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  gender: z.enum(GENDERS).optional(),
  dateOfBirth: z.coerce.date().optional(),
  batch: z.string().trim().optional(),
  weight: z.coerce.number().min(0).optional(),
  chest: z.coerce.number().min(0).optional(),
  arm: z.coerce.number().min(0).optional(),
  notes: z.string().trim().optional(),
  status: z.enum(MEMBER_STATUSES).optional(),
});

export const updateMemberSchema = createMemberSchema.partial();

export const importMembersSchema = z.object({
  branch: z.string().regex(objectIdRegex, "Invalid branch id").optional(),
  members: z.array(z.record(z.string(), z.unknown())).min(1, "No rows to import").max(5000, "Too many rows at once"),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type ImportMembersInput = z.infer<typeof importMembersSchema>;
