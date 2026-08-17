// hooks/useActiveLive.js
import { useEffect, useState } from "react";
import { liveApi } from "@/api/axios";

export function useActiveLive(pollMs = 10000) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    let cancelled = false;
 
    const fetchActive = async () => {
      try {
        const data = await liveApi.getActive();
        if (!cancelled) setActiveUsers(data);
      } catch {
        // swallow — badges just won't update this tick
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
 
    fetchActive();
    const interval = setInterval(fetchActive, pollMs);
 
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pollMs]);
 
  const isUserLive = (userId) => activeUsers.some((u) => u.userId === userId);
 
  return { activeUsers, loading, isUserLive };
}