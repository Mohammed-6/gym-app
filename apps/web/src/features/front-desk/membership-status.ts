import { Membership } from "@/features/memberships/types";
import { Member } from "@/features/members/types";

export type MembershipStatusKind = "active" | "expiring" | "upcoming" | "expired" | "none";

export interface MembershipStatusInfo {
  kind: MembershipStatusKind;
  membership?: Membership;
  days?: number;
}

const EXPIRING_SOON_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
}

/** Memberships are assumed sorted newest-first (by startDate desc), as the API returns them. */
export function getMembershipStatus(memberships: Membership[]): MembershipStatusInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const current = memberships.find((m) => m.status === "active");

  if (current) {
    const start = new Date(current.startDate);
    const end = new Date(current.endDate);

    if (start > today) {
      return { kind: "upcoming", membership: current, days: daysBetween(start, today) };
    }

    const daysLeft = daysBetween(end, today);
    if (daysLeft <= EXPIRING_SOON_DAYS) {
      return { kind: "expiring", membership: current, days: daysLeft };
    }
    return { kind: "active", membership: current, days: daysLeft };
  }

  const mostRecent = memberships[0];
  if (mostRecent) {
    const end = new Date(mostRecent.endDate);
    return { kind: "expired", membership: mostRecent, days: daysBetween(today, end) };
  }

  return { kind: "none" };
}

export interface QuickMembershipStatusInfo {
  kind: MembershipStatusKind;
  days?: number;
  plan?: { _id: string; name: string } | string;
  startDate?: string;
  endDate?: string;
  finalAmount?: number;
}

/**
 * Lightweight status for a member row in the search results list, computed from the
 * `latestMembership` summary the member-search endpoint already returns (no extra fetch).
 * `latestMembership` is the member's most recent membership regardless of status, so an
 * expired member still shows their last plan and expiry date instead of looking like they
 * never had one.
 */
export function getQuickMembershipStatus(member: Pick<Member, "latestMembership">): QuickMembershipStatusInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const latest = member.latestMembership;
  if (!latest) {
    return { kind: "none" };
  }

  const base = {
    plan: latest.plan,
    startDate: latest.startDate,
    endDate: latest.endDate,
    finalAmount: latest.finalAmount,
  };

  const start = new Date(latest.startDate);
  if (latest.status === "active" && start > today) {
    return { ...base, kind: "upcoming", days: daysBetween(start, today) };
  }

  const end = new Date(latest.endDate);
  const daysLeft = daysBetween(end, today);

  if (latest.status !== "active" || daysLeft < 0) {
    return { ...base, kind: "expired", days: Math.abs(daysLeft) };
  }
  if (daysLeft <= EXPIRING_SOON_DAYS) {
    return { ...base, kind: "expiring", days: daysLeft };
  }
  return { ...base, kind: "active", days: daysLeft };
}

export function outstandingDue(payments: { totalAmount: number; paidAmount: number }[]): number {
  const total = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const paid = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  return Math.max(0, total - paid);
}
