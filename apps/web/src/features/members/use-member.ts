"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { getMember } from "./api";
import { Member } from "./types";

export function useMember(id: string) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch on id/refreshKey change must show a fresh loading state
    setIsLoading(true);

    getMember(id)
      .then((data) => {
        if (!ignore) setMember(data);
      })
      .catch((error) => {
        if (!ignore) toast.error(getApiErrorMessage(error, "Could not load member"));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id, refreshKey]);

  function refresh() {
    setRefreshKey((key) => key + 1);
  }

  return { member, isLoading, refresh };
}
