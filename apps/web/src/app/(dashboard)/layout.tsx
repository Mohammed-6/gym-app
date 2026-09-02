"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/features/auth/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 print:block print:bg-white">
      <div className="no-print contents">
        <Sidebar />
      </div>
      <div className="flex min-h-screen flex-1 flex-col print:min-h-0">
        <div className="no-print contents">
          <Topbar />
        </div>
        <main className="flex-1 p-4 sm:p-6 print:p-0">{children}</main>
      </div>
    </div>
  );
}
