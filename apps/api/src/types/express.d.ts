import { UserRole } from "@gym-app/shared";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        branchId: string | null;
      };
    }
  }
}

export {};
