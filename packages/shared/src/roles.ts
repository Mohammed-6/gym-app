export const USER_ROLES = ["admin", "receptionist"] as const;
export type UserRole = (typeof USER_ROLES)[number];
