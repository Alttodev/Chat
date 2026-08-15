// hooks/useJoinLive.js
import { useCallback, useState } from "react";
import { liveApi } from "@/api/axios";

/**
 * Handles a viewer joining a specific host's live session.
 * Usage: const { session, joinLive, leaveLive } = useJoinLive();
 *        await joinLive(hostUserId)
 */
export function useJoinLive() {
  const [session, setSession] = useState(null); // { token, url, roomName } | null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const joinLive = useCallback(async (hostUserId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await liveApi.join(hostUserId);
      setSession({
        token: data.token,
        serverUrl: data.url,
        roomName: data.roomName,
        hostUsername: data.hostUsername,
        hostAvatarUrl: data.hostAvatarUrl,
      });
      return data;
    } catch (err) {
      setError(
        err.response?.data?.error || "This user isn't live right now."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveLive = useCallback(() => {
    setSession(null);
  }, []);

  return { session, loading, error, joinLive, leaveLive };
}