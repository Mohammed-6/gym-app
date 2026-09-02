import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "default" | "success" | "warning" | "danger";
}

const accentClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "bg-slate-100 text-slate-600",
  success: "bg-emerald-100 text-emerald-600",
  warning: "bg-amber-100 text-amber-600",
  danger: "bg-red-100 text-red-600",
};

export function StatCard({ label, value, icon: Icon, accent = "default" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", accentClasses[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-0.5 text-xl font-semibold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
