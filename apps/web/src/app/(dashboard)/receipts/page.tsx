"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api";
import { listReceipts } from "@/features/receipts/api";
import { PaginatedResponse, Receipt } from "@/features/receipts/types";

export default function ReceiptsPage() {
  const [result, setResult] = useState<PaginatedResponse<Receipt> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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

    listReceipts({ page, search: search || undefined })
      .then((data) => {
        if (!ignore) setResult(data);
      })
      .catch((error) => {
        if (!ignore) toast.error(getApiErrorMessage(error, "Could not load receipts"));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, search]);

  const receipts = result?.items ?? [];
  const meta = result?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Receipts</h1>
        <p className="mt-1 text-sm text-slate-500">View, print, or reprint any receipt.</p>
      </div>

      <Input
        placeholder="Search by receipt number, member ID, or name..."
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        className="sm:max-w-xs"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receipt Number</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-slate-400">
                Loading...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && receipts.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-slate-400">
                No receipts found.
              </TableCell>
            </TableRow>
          )}
          {receipts.map((receipt) => (
            <TableRow key={receipt._id}>
              <TableCell className="font-mono text-xs text-slate-500">{receipt.receiptNumber}</TableCell>
              <TableCell className="font-medium text-slate-900">{receipt.memberSnapshot.name}</TableCell>
              <TableCell>{new Date(receipt.paymentDate).toLocaleDateString()}</TableCell>
              <TableCell>₹{receipt.total.toLocaleString("en-IN")}</TableCell>
              <TableCell className="text-right">
                <Link href={`/receipts/${receipt._id}`} className="text-sm text-slate-500 hover:text-slate-900">
                  View / Print
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {meta.page} of {meta.totalPages} &middot; {meta.total} receipts
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
