// hooks/pollHooks.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import axiosInstance from "@/api/axiosInstance";

export function usePollCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ question, options }) =>
      axiosInstance
        .post("/post/create-poll", { question, options })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_post"] });
    },
  });
}

// Casting a vote on a poll post. Kept separate from postHooks since it's
// a different action shape (optionId, not postText/image).
export function usePollVote(postId, initialPost) {
  const [post, setPost] = useState(initialPost);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState(null);

  const vote = useCallback(
    async (optionId) => {
      setVoting(true);
      setError(null);
      try {
        const res = await axiosInstance.post(`/post/${postId}/vote`, {
          optionId,
        });
        setPost(res.data.post);
      } catch (err) {
        setError(err?.response?.data?.message || "Couldn't submit vote.");
      } finally {
        setVoting(false);
      }
    },
    [postId],
  );

  return { post, voting, error, vote };
}
