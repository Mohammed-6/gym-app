import { z } from "zod";

export const updateSettingsSchema = z.object({
  // Empty string is valid and meaningful here (plain numeric member IDs, no prefix) — only
  // the character set and length are constrained, not "presence".
  memberIdPrefix: z
    .string()
    .trim()
    .max(10, "Keep it to 10 characters or fewer")
    .regex(/^[A-Za-z0-9]*$/, "Letters and numbers only")
    .optional(),
  // The next auto-generated member number (e.g. set to 201 so the next member becomes J201).
  // Deliberately not validated against the current count — an admin override should always win.
  nextMemberNumber: z.coerce.number().int().min(1, "Must be at least 1").optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
