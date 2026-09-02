"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api";
import { getReceipt } from "@/features/receipts/api";
import { Receipt } from "@/features/receipts/types";
import { paymentMethodLabels, paymentPurposeLabels } from "@/features/payments/labels";

function branchInfo(branch: Receipt["branch"]) {
  if (typeof branch === "string") return { name: "Gym Manager", address: undefined, phone: undefined };
  return branch;
}

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    getReceipt(id)
      .then((data) => {
        if (!ignore) setReceipt(data);
      })
      .catch((error) => {
        if (!ignore) toast.error(getApiErrorMessage(error, "Could not load receipt"));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading receipt...</p>;
  }

  if (!receipt) {
    return <p className="text-sm text-slate-500">Receipt not found.</p>;
  }

  const branch = branchInfo(receipt.branch);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="no-print flex items-center justify-between">
        <Link href="/receipts" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Back to Receipts
        </Link>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print Receipt
        </Button>
      </div>

      <div className="print-area rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="border-b border-dashed border-slate-300 pb-4 text-center">
          <h1 className="text-xl font-bold text-slate-900">{branch.name}</h1>
          {branch.address && <p className="text-sm text-slate-500">{branch.address}</p>}
          {branch.phone && <p className="text-sm text-slate-500">Phone: {branch.phone}</p>}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <div>
            <span className="text-slate-500">Receipt No: </span>
            <span className="font-mono font-medium text-slate-900">{receipt.receiptNumber}</span>
          </div>
          <div>
            <span className="text-slate-500">Date: </span>
            <span className="font-medium text-slate-900">
              {new Date(receipt.paymentDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="mt-1 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
          {paymentPurposeLabels[receipt.purpose] ?? receipt.purpose}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-200 pt-4 text-sm">
          <div>
            <span className="text-slate-500">Member ID: </span>
            <span className="font-medium text-slate-900">{receipt.memberSnapshot.memberId}</span>
          </div>
          <div>
            <span className="text-slate-500">Name: </span>
            <span className="font-medium text-slate-900">{receipt.memberSnapshot.name}</span>
          </div>
          {receipt.memberSnapshot.fatherName && (
            <div>
              <span className="text-slate-500">Father&apos;s Name: </span>
              <span className="font-medium text-slate-900">{receipt.memberSnapshot.fatherName}</span>
            </div>
          )}
          <div>
            <span className="text-slate-500">Phone: </span>
            <span className="font-medium text-slate-900">{receipt.memberSnapshot.phone}</span>
          </div>
          {receipt.memberSnapshot.batch && (
            <div>
              <span className="text-slate-500">Batch: </span>
              <span className="font-medium text-slate-900">{receipt.memberSnapshot.batch}</span>
            </div>
          )}
          {receipt.memberSnapshot.address && (
            <div className="col-span-2">
              <span className="text-slate-500">Address: </span>
              <span className="font-medium text-slate-900">{receipt.memberSnapshot.address}</span>
            </div>
          )}
        </div>

        <table className="mt-4 w-full border-t border-slate-200 pt-4 text-sm">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-500">Membership Fees</td>
              <td className="py-2 text-right text-slate-900">₹{receipt.membershipFees.toLocaleString("en-IN")}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-500">Other Fees</td>
              <td className="py-2 text-right text-slate-900">₹{receipt.otherFees.toLocaleString("en-IN")}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-500">Discount</td>
              <td className="py-2 text-right text-slate-900">- ₹{receipt.discount.toLocaleString("en-IN")}</td>
            </tr>
            <tr className="border-b border-slate-200 font-medium">
              <td className="py-2 text-slate-900">Total</td>
              <td className="py-2 text-right text-slate-900">₹{receipt.total.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td className="py-2 text-slate-500">Paid</td>
              <td className="py-2 text-right text-slate-900">₹{receipt.paid.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td className="py-2 font-medium text-slate-900">Due</td>
              <td className={`py-2 text-right font-medium ${receipt.due > 0 ? "text-red-600" : "text-emerald-600"}`}>
                ₹{receipt.due.toLocaleString("en-IN")}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
          <div>
            <span className="text-slate-500">Payment Method: </span>
            <span className="font-medium text-slate-900">
              {paymentMethodLabels[receipt.paymentMethod] ?? receipt.paymentMethod}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Received By: </span>
            <span className="font-medium text-slate-900">{receipt.receivedBy}</span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">Thank you for choosing {branch.name}!</p>
      </div>
    </div>
  );
}
