// hooks/useBroadcast.js
import { useCallback, useState } from "react";
import { liveApi } from "@/api/axios";

export function useBroadcast() {
  const [session, setSession] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const startLive = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await liveApi.start();
      setSession({
        token: data.token,
        serverUrl: data.url,
        roomName: data.roomName,
        sessionId: data.sessionId,
      });
      return data;
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't start live session.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
 
  const endLive = useCallback(async () => {
    setLoading(true);
    try {
      await liveApi.end();
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);
 
  return { session, loading, error, startLive, endLive };
}
 