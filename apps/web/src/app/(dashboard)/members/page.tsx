"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api";
import { deleteMember, listMembers } from "@/features/members/api";
import { Member, PaginatedResponse } from "@/features/members/types";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
] as const;

export default function MembersPage() {
  const [result, setResult] = useState<PaginatedResponse<Member> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch on filter/page change must show a fresh loading state
    setIsLoading(true);

    listMembers({ page, search, status: status || undefined, sortBy, sortOrder })
      .then((data) => {
        if (!ignore) setResult(data);
      })
      .catch((error) => {
        if (!ignore) toast.error(getApiErrorMessage(error, "Could not load members"));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, search, status, sortBy, sortOrder, refreshKey]);

  function refresh() {
    setRefreshKey((key) => key + 1);
  }

  function toggleSort(field: string) {
    if (sortBy === field) {
      setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  async function handleDelete(member: Member) {
    if (!window.confirm(`Delete member "${member.firstName} ${member.lastName ?? ""}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteMember(member._id);
      toast.success("Member deleted successfully");
      refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete member"));
    }
  }

  const members = result?.items ?? [];
  const meta = result?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Members</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your gym members.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/members/import" className={buttonVariants({ variant: "outline" })}>
            <Upload className="h-4 w-4" />
            Import
          </Link>
          <Link href="/members/new" className={buttonVariants()}>
            <Plus className="h-4 w-4" />
            Add Member
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search by member ID, name, or phone..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-1 rounded-md bg-slate-100 p-1">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatus(filter.value);
                setPage(1);
              }}
              className={cn(
                "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                status === filter.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                type="button"
                onClick={() => toggleSort("memberId")}
                className="inline-flex items-center gap-1"
              >
                Member ID
                {sortBy === "memberId" &&
                  (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => toggleSort("firstName")}
                className="inline-flex items-center gap-1"
              >
                Name
                {sortBy === "firstName" &&
                  (sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
              </button>
            </TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Membership</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-slate-400">
                Loading...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && members.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-slate-400">
                No members found.
              </TableCell>
            </TableRow>
          )}
          {members.map((member) => (
            <TableRow key={member._id}>
              <TableCell className="font-mono text-xs text-slate-500">{member.memberId}</TableCell>
              <TableCell className="font-medium text-slate-900">
                {member.firstName} {member.lastName}
              </TableCell>
              <TableCell>{member.phone}</TableCell>
              <TableCell>{member.batch || "-"}</TableCell>
              <TableCell>
                {member.latestMembership
                  ? typeof member.latestMembership.plan === "string"
                    ? member.latestMembership.plan
                    : member.latestMembership.plan.name
                  : <span className="text-slate-400">-</span>}
              </TableCell>
              <TableCell>
                {member.latestMembership ? (
                  <span className={member.latestMembership.status !== "active" ? "text-red-600" : undefined}>
                    {new Date(member.latestMembership.endDate).toLocaleDateString()}
                    {member.latestMembership.status !== "active" && " (expired)"}
                  </span>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={member.status === "active" ? "success" : "neutral"}>
                  {member.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuItem href={`/members/${member._id}`}>
                    <Eye className="h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem href={`/members/${member._id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem danger onClick={() => handleDelete(member)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {meta.page} of {meta.totalPages} &middot; {meta.total} members
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
