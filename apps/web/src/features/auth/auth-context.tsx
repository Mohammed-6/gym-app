"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getToken, setToken } from "@/lib/auth-token";
import { fetchCurrentUser, loginRequest } from "./api";
import { AuthUser } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(getToken()));
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }
    fetchCurrentUser()
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginRequest(email, password);
      setToken(result.token);
      setUser(result.user);
      // Receptionists spend their day checking members in/out at the front desk;
      // admins care more about the overview stats.
      router.push(result.user.role === "admin" ? "/dashboard" : "/front-desk");
    },
    [router]
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
