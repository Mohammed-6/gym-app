import { UserRole } from "@gym-app/shared";

export interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  branch: { _id: string; name: string } | null;
  isActive: boolean;
  createdAt: string;
}

export interface StaffUserInput {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  branch: string | null;
  isActive?: boolean;
}
