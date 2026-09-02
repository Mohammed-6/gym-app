import { UserRole } from "@gym-app/shared";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch: { _id: string; name: string } | string | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
