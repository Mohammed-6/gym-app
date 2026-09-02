"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { getReceiptByPayment } from "@/features/receipts/api";

export default function ReceiptByPaymentPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = use(params);
  const router = useRouter();

  useEffect(() => {
    let ignore = false;

    getReceiptByPayment(paymentId)
      .then((receipt) => {
        if (!ignore) router.replace(`/receipts/${receipt._id}`);
      })
      .catch((error) => {
        if (!ignore) toast.error(getApiErrorMessage(error, "Could not find receipt"));
      });

    return () => {
      ignore = true;
    };
  }, [paymentId, router]);

  return <p className="text-sm text-slate-500">Loading receipt...</p>;
}
