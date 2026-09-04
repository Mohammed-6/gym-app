"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bug,
  Building2,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Receipt,
  Search,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/auth-context";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Front Desk", href: "/front-desk", icon: Search },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Members", href: "/members", icon: Users },
  { label: "Membership Plans", href: "/membership-plans", icon: ClipboardList },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Receipts", href: "/receipts", icon: Receipt },
  { label: "Issue Reports", href: "/issue-reports", icon: Bug },
  { label: "Branches", href: "/branches", icon: Building2, adminOnly: true },
  { label: "Users", href: "/users", icon: UserCog, adminOnly: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex h-14 items-center border-b border-slate-200 px-4">
        <span className="text-base font-semibold text-slate-900">Gym Manager</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems
          .filter((item) => !item.adminOnly || user?.role === "admin")
          .map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
