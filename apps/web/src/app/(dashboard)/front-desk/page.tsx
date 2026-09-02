"use client";

import { useEffect, useRef, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api";
import { listMembers } from "@/features/members/api";
import { Member } from "@/features/members/types";
import { QuickAddMemberDialog } from "@/features/members/quick-add-member-dialog";
import { MemberPanel } from "@/features/front-desk/member-panel";
import { getQuickMembershipStatus } from "@/features/front-desk/membership-status";
import { membershipStatusConfig } from "@/features/front-desk/status-config";

export default function FrontDeskPage() {
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState<Member[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const query = searchInput.trim();
    let ignore = false;

    const timeout = setTimeout(() => {
      if (!query) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);

      listMembers({ search: query, limit: 8 })
        .then((data) => {
          if (ignore) return;
          setResults(data.items);
          setHasSearched(true);
          // A single exact Member ID match means the receptionist typed the full ID off the
          // paper sign-in sheet — jump straight to their record instead of an extra click.
          if (data.items.length === 1 && data.items[0].memberId.toLowerCase() === query.toLowerCase()) {
            setSelectedMemberId(data.items[0]._id);
          }
        })
        .catch((error) => {
          if (!ignore) toast.error(getApiErrorMessage(error, "Search failed"));
        })
        .finally(() => {
          if (!ignore) setIsSearching(false);
        });
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timeout);
    };
  }, [searchInput]);

  function selectMember(member: Member) {
    setSelectedMemberId(member._id);
  }

  function handleMemberCreated(member: Member) {
    setSearchInput("");
    setResults([]);
    setSelectedMemberId(member._id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Front Desk</h1>
          <p className="mt-1 text-sm text-slate-500">
            Search a member&apos;s ID, name, or phone to check their status, renew, or collect payment.
          </p>
        </div>
        <Button onClick={() => setQuickAddOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Add New Member
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          ref={searchInputRef}
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setSelectedMemberId(null);
          }}
          placeholder="Search Member ID, name, or phone..."
          className="h-12 pl-10 text-base"
          autoComplete="off"
        />
      </div>

      {!selectedMemberId && searchInput.trim() && (
        <div className="space-y-2">
          {isSearching && <p className="text-sm text-slate-400">Searching...</p>}

          {!isSearching && hasSearched && results.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white py-10 text-center">
              <p className="text-sm text-slate-500">No member found for &quot;{searchInput.trim()}&quot;.</p>
              <Button onClick={() => setQuickAddOpen(true)}>
                <UserPlus className="h-4 w-4" />
                Quick Add Member
              </Button>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {results.map((member) => {
                const quickStatus = getQuickMembershipStatus(member);
                const config = membershipStatusConfig[quickStatus.kind];
                const planName =
                  typeof quickStatus.plan === "string" ? quickStatus.plan : quickStatus.plan?.name;
                return (
                  <button
                    key={member._id}
                    type="button"
                    onClick={() => selectMember(member)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {member.memberId} &middot; {member.phone}
                        {member.batch && ` · ${member.batch}`}
                      </p>
                      {member.lastPayment && (
                        <p className="text-xs text-slate-400">
                          Last paid ₹{member.lastPayment.paidAmount.toLocaleString("en-IN")} on{" "}
                          {new Date(member.lastPayment.paymentDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant={config.badgeVariant}>{config.shortLabel(quickStatus.days)}</Badge>
                      {planName ? (
                        <p className="text-xs text-slate-500">
                          {planName} &middot; {quickStatus.kind === "expired" ? "expired" : "expires"}{" "}
                          {new Date(quickStatus.endDate!).toLocaleDateString()}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">No membership yet</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedMemberId && <MemberPanel memberId={selectedMemberId} />}

      <QuickAddMemberDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        initialSearch={searchInput.trim()}
        onCreated={handleMemberCreated}
      />
    </div>
  );
}
