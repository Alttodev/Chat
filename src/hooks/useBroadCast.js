// hooks/useBroadcast.js
import { useCallback, useState } from "react";
import { liveApi } from "@/api/axios";

/**
 * Manages the current user's own live session (starting/ending it).
 * Returns the LiveKit session details once started so you can pass
 * them straight into <Broadcaster />.
 */
export function useBroadcast() {
  const [session, setSession] = useState(null); // { token, url, roomName } | null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startLive = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const data = await liveApi.start();
        console.log("Live session started:", data);
        console.log("url:", data.url);
      setSession({ token: data.token, serverUrl: data.url, roomName: data.roomName });
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