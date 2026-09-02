"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { listMembershipsForMember } from "./api";
import { Membership } from "./types";

export function useMemberships(memberId: string) {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch on refreshKey change must show a fresh loading state
    setIsLoading(true);

    listMembershipsForMember(memberId)
      .then((data) => {
        if (!ignore) setMemberships(data);
      })
      .catch((error) => {
        if (!ignore) toast.error(getApiErrorMessage(error, "Could not load memberships"));
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

  return { memberships, isLoading, refresh };
}
