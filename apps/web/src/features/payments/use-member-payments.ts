"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { listPayments } from "./api";
import { Payment } from "./types";

export function useMemberPayments(memberId: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch on refreshKey change must show a fresh loading state
    setIsLoading(true);

    listPayments({ member: memberId })
      .then((data) => {
        if (!ignore) setPayments(data.items);
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
  }, [memberId, refreshKey]);

  function refresh() {
    setRefreshKey((key) => key + 1);
  }

  return { payments, isLoading, refresh };
}
