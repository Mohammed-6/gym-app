"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  IndianRupee,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-context";
import { getDashboardSummary } from "@/features/dashboard/api";
import { DashboardSummary } from "@/features/dashboard/types";
import { StatCard } from "@/features/dashboard/stat-card";

function nameOf(entity: { firstName: string; lastName?: string; memberId?: string } | string) {
  if (typeof entity === "string") return entity;
  return `${entity.firstName} ${entity.lastName ?? ""}`.trim();
}

function idOf(entity: { memberId?: string } | string) {
  if (typeof entity === "string") return "";
  return entity.memberId ?? "";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    getDashboardSummary()
      .then((data) => {
        if (!ignore) setSummary(data);
      })
      .catch((error) => {
        if (!ignore) toast.error(getApiErrorMessage(error, "Could not load dashboard"));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back{user ? `, ${user.name}` : ""}</h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening at your gym today.</p>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading dashboard...</p>}

      {summary && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Total Members" value={summary.totalMembers} icon={Users} />
            <StatCard label="Active Members" value={summary.activeMembers} icon={UserCheck} accent="success" />
            <StatCard label="Expired Members" value={summary.expiredMembers} icon={UserX} accent="danger" />
            <StatCard
              label="Expiring Soon"
              value={summary.membershipsExpiringSoon}
              icon={AlertTriangle}
              accent="warning"
            />
            <StatCard
              label="Today's Payments"
              value={`₹${summary.todaysPayments.toLocaleString("en-IN")}`}
              icon={CalendarClock}
            />
            <StatCard
              label="Total Revenue"
              value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`}
              icon={IndianRupee}
              accent="success"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Recent Members</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.recentMembers.length === 0 ? (
                  <p className="text-sm text-slate-500">No members yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {summary.recentMembers.map((member) => (
                      <li key={member._id}>
                        <Link href={`/members/${member._id}`} className="flex items-center justify-between text-sm hover:text-slate-900">
                          <span className="font-medium text-slate-800">
                            {member.firstName} {member.lastName}
                          </span>
                          <span className="font-mono text-xs text-slate-400">{member.memberId}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.recentPayments.length === 0 ? (
                  <p className="text-sm text-slate-500">No payments yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {summary.recentPayments.map((payment) => (
                      <li key={payment._id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-800">{nameOf(payment.member)}</span>
                        <span className="font-medium text-slate-900">
                          ₹{payment.paidAmount.toLocaleString("en-IN")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recently Expired Memberships</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.recentlyExpiredMemberships.length === 0 ? (
                  <p className="text-sm text-slate-500">No expired memberships.</p>
                ) : (
                  <ul className="space-y-3">
                    {summary.recentlyExpiredMemberships.map((membership) => (
                      <li key={membership._id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-800">
                          {nameOf(membership.member)}{" "}
                          <span className="font-mono text-xs text-slate-400">{idOf(membership.member)}</span>
                        </span>
                        <Badge variant="danger">
                          {new Date(membership.endDate).toLocaleDateString()}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
