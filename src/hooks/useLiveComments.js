// hooks/useLiveComments.js
import { useState, useEffect, useRef, useCallback } from "react";
import { liveApi } from "@/api/axios";

export function useLiveComments(hostUserId, pollMs = 500) {
  const [comments, setComments] = useState([]);
  const [posting, setPosting] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchComments = async () => {
      try {
        const data = await liveApi.getComments(hostUserId);
        if (mountedRef.current) setComments(data);
      } catch {
        // transient network hiccup — next poll (0.5s later) will retry
      }
    };

    fetchComments();
    const interval = setInterval(fetchComments, pollMs);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [hostUserId, pollMs]);

  const postComment = useCallback(
    async (text) => {
      if (!text.trim()) return;
      setPosting(true);
      try {
        await liveApi.postComment(hostUserId, text);
      } finally {
        setPosting(false);
      }
    },
    [hostUserId]
  );

  return { comments, postComment, posting };
}