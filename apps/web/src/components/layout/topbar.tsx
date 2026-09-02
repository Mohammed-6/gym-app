"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <span className="text-sm font-medium text-slate-900 md:hidden">Gym Manager</span>
      <div className="ml-auto flex items-center gap-3">
        {user && (
          <Link href="/profile" className="text-right hover:opacity-70">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs capitalize text-slate-500">{user.role}</p>
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
