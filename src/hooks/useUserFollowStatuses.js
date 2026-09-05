
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBatchFollowStatus } from "@/api/axios";

export function useUserFollowStatuses(toIds = []) {
  const idsKey = toIds.join(",");

  const { data, isLoading } = useQuery({
    queryKey: ["request_info_batch", idsKey],
    queryFn: () => getBatchFollowStatus(toIds),
    enabled: toIds.length > 0,
    refetchOnWindowFocus: false,
  });

  const [overrides, setOverrides] = useState({});

  const statuses = useMemo(() => {
    const base = data?.statuses || {};
    return { ...base, ...overrides };
  }, [data, overrides]);

  const setStatus = useCallback((userId, patch) => {
    setOverrides((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], ...patch },
    }));
  }, []);

  return { statuses, isLoading, setStatus };
}