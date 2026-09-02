"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api";
import { deleteMembershipPlan, listMembershipPlans } from "@/features/membership-plans/api";
import { PlanFormDialog } from "@/features/membership-plans/plan-form-dialog";
import { MembershipPlan } from "@/features/membership-plans/types";

export default function MembershipPlansPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((key) => key + 1);
  }

  useEffect(() => {
    let ignore = false;

    listMembershipPlans()
      .then((data) => {
        if (!ignore) setPlans(data);
      })
      .catch((error) => {
        if (!ignore) toast.error(getApiErrorMessage(error, "Could not load membership plans"));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  function openAddDialog() {
    setEditingPlan(null);
    setDialogOpen(true);
  }

  function openEditDialog(plan: MembershipPlan) {
    setEditingPlan(plan);
    setDialogOpen(true);
  }

  async function handleDelete(plan: MembershipPlan) {
    if (!window.confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;
    try {
      await deleteMembershipPlan(plan._id);
      toast.success("Membership plan deleted successfully");
      refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete membership plan"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Membership Plans</h1>
          <p className="mt-1 text-sm text-slate-500">Define the plans members can subscribe to.</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Plan
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-slate-400">
                Loading...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && plans.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-slate-400">
                No membership plans yet. Add your first plan to get started.
              </TableCell>
            </TableRow>
          )}
          {plans.map((plan) => (
            <TableRow key={plan._id}>
              <TableCell className="font-medium text-slate-900">{plan.name}</TableCell>
              <TableCell>
                {plan.durationInMonths} month{plan.durationInMonths > 1 ? "s" : ""}
              </TableCell>
              <TableCell>₹{plan.price.toLocaleString("en-IN")}</TableCell>
              <TableCell className="max-w-xs truncate text-slate-500">{plan.description || "-"}</TableCell>
              <TableCell>
                <Badge variant={plan.isActive ? "success" : "neutral"}>
                  {plan.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuItem onClick={() => openEditDialog(plan)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem danger onClick={() => handleDelete(plan)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PlanFormDialog open={dialogOpen} onOpenChange={setDialogOpen} plan={editingPlan} onSaved={refresh} />
    </div>
  );
}
