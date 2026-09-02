import { AlertTriangle, CheckCircle2, Clock, LucideIcon, XCircle } from "lucide-react";
import { MembershipStatusKind } from "./membership-status";

export interface StatusConfigEntry {
  label: (days?: number) => string;
  shortLabel: (days?: number) => string;
  icon: LucideIcon;
  className: string;
  badgeVariant: "success" | "warning" | "danger" | "neutral";
}

export const membershipStatusConfig: Record<MembershipStatusKind, StatusConfigEntry> = {
  active: {
    label: (days) => `Active — ${days} day${days === 1 ? "" : "s"} left`,
    shortLabel: (days) => `Active · ${days}d left`,
    icon: CheckCircle2,
    className: "bg-emerald-50 border-emerald-200 text-emerald-800",
    badgeVariant: "success",
  },
  expiring: {
    label: (days) => (days && days <= 0 ? "Expires today" : `Expiring soon — ${days} day${days === 1 ? "" : "s"} left`),
    shortLabel: (days) => (days && days <= 0 ? "Expires today" : `Expiring · ${days}d left`),
    icon: AlertTriangle,
    className: "bg-amber-50 border-amber-200 text-amber-800",
    badgeVariant: "warning",
  },
  upcoming: {
    label: (days) => `Upcoming membership starts in ${days} day${days === 1 ? "" : "s"}`,
    shortLabel: (days) => `Starts in ${days}d`,
    icon: Clock,
    className: "bg-blue-50 border-blue-200 text-blue-800",
    badgeVariant: "neutral",
  },
  expired: {
    label: (days) => `Expired ${days} day${days === 1 ? "" : "s"} ago — notify member to renew`,
    shortLabel: (days) => `${-Math.abs(days ?? 0)}d`,
    icon: XCircle,
    className: "bg-red-50 border-red-200 text-red-800",
    badgeVariant: "danger",
  },
  none: {
    label: () => "No membership yet — assign a plan to get started",
    shortLabel: () => "No membership",
    icon: AlertTriangle,
    className: "bg-slate-50 border-slate-200 text-slate-600",
    badgeVariant: "neutral",
  },
};
