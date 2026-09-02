"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getApiErrorMessage } from "@/lib/api";
import { listPayments } from "@/features/payments/api";
import { paymentPurposeLabels } from "@/features/payments/labels";
import { Payment, PaginatedResponse } from "@/features/payments/types";

const PAYMENT_METHOD_OPTIONS = [
  { label: "All Methods", value: "" },
  { label: "Cash", value: "cash" },
  { label: "UPI", value: "upi" },
  { label: "Card", value: "card" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Other", value: "other" },
];

function memberLabel(member: Payment["member"]) {
  if (typeof member === "string") return member;
  return `${member.firstName} ${member.lastName ?? ""} (${member.memberId})`;
}

export default function PaymentsPage() {
  const [result, setResult] = useState<PaginatedResponse<Payment> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch on filter/page change must show a fresh loading state
    setIsLoading(true);

    listPayments({
      page,
      paymentMethod: paymentMethod || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
      .then((data) => {
        if (!ignore) setResult(data);
      })
      .catch((error) => {
        if (!ignore) toast.error(getApiErrorMessage(error, "Could not load payments"));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, paymentMethod, dateFrom, dateTo]);

  const payments = result?.items ?? [];
  const meta = result?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">All payments collected across your gym.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={paymentMethod}
          onChange={(event) => {
            setPaymentMethod(event.target.value);
            setPage(1);
          }}
          className="sm:max-w-xs"
        >
          {PAYMENT_METHOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(event) => {
            setDateFrom(event.target.value);
            setPage(1);
          }}
          className="sm:max-w-[160px]"
        />
        <span className="text-sm text-slate-400">to</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(event) => {
            setDateTo(event.target.value);
            setPage(1);
          }}
          className="sm:max-w-[160px]"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receipt Number</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
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
          {!isLoading && payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-slate-400">
                No payments found.
              </TableCell>
            </TableRow>
          )}
          {payments.map((payment) => (
            <TableRow key={payment._id}>
              <TableCell className="font-mono text-xs text-slate-500">{payment.receiptNumber}</TableCell>
              <TableCell className="font-medium text-slate-900">{memberLabel(payment.member)}</TableCell>
              <TableCell className="text-slate-500">{paymentPurposeLabels[payment.purpose] ?? payment.purpose}</TableCell>
              <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
              <TableCell>₹{payment.paidAmount.toLocaleString("en-IN")}</TableCell>
              <TableCell className="capitalize">{payment.paymentMethod.replace("_", " ")}</TableCell>
              <TableCell>
                <Badge variant={payment.dueAmount > 0 ? "warning" : "success"}>
                  {payment.dueAmount > 0 ? "Partial" : "Paid"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/receipts/by-payment/${payment._id}`}
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  Receipt
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {meta.page} of {meta.totalPages} &middot; {meta.total} payments
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
