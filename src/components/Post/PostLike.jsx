import React, { useEffect, useMemo, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import { toastError } from "@/lib/toast";
import { usePostLike } from "@/hooks/postHooks";

const REACTIONS = [
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "clap", emoji: "👏", label: "Clap" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
];

function getReactionFromLikedBy(likedBy = [], currentUserId) {
  if (!Array.isArray(likedBy) || !currentUserId) return null;

  const found = likedBy.find(
    (item) => String(item?.user) === String(currentUserId),
  );
  return found?.type || null;
}

function PostLikeComponent({ post, currentUserId, onLikeChange }) {
  const { mutateAsync: postLike } = usePostLike();

  const [likedByList, setLikedByList] = useState(
    Array.isArray(post?.likedBy) ? post.likedBy : [],
  );
  const [myReaction, setMyReaction] = useState(
    post?.myReaction ||
      getReactionFromLikedBy(post?.likedBy, currentUserId) ||
      (post?.likedByMe ? "love" : null),
  );

  const [showReactions, setShowReactions] = useState(false);
  const [jumpReaction, setJumpReaction] = useState(null);
  const [jumpToken, setJumpToken] = useState(0);
  const jumpTimerRef = useRef(null);

  useEffect(() => {
    setLikedByList(Array.isArray(post?.likedBy) ? post.likedBy : []);
    setMyReaction(
      post?.myReaction ||
        getReactionFromLikedBy(post?.likedBy, currentUserId) ||
        (post?.likedByMe ? "love" : null),
    );
  }, [post?.likedBy, post?.myReaction, post?.likedByMe, currentUserId]);

  useEffect(() => {
    return () => {
      if (jumpTimerRef.current) {
        clearTimeout(jumpTimerRef.current);
      }
    };
  }, []);

  const activeReaction = useMemo(
    () => REACTIONS.find((item) => item.type === myReaction),
    [myReaction],
  );

  const triggerJump = (reactionType) => {
    if (!reactionType) return;

    setJumpReaction(reactionType);
    setJumpToken((prev) => prev + 1);

    if (jumpTimerRef.current) {
      clearTimeout(jumpTimerRef.current);
    }

    jumpTimerRef.current = setTimeout(() => {
      setJumpReaction(null);
    }, 500);
  };

  const handleReact = async (reactionType) => {
    const previousReaction = myReaction;
    const previousLikedBy = likedByList;

    const nextReaction =
      previousReaction === reactionType ? null : reactionType;

    setMyReaction(nextReaction);
    setShowReactions(false);
    triggerJump(reactionType);

    try {
      const res = await postLike({
        id: post._id,
        type: nextReaction,
      });

      const updatedLikedBy = res?.likedBy || res?.data?.likedBy;
      const updatedMyReaction =
        res?.myReaction ||
        res?.data?.myReaction ||
        getReactionFromLikedBy(updatedLikedBy, currentUserId) ||
        nextReaction;

      if (Array.isArray(updatedLikedBy)) {
        setLikedByList(updatedLikedBy);
      }

      setMyReaction(updatedMyReaction);

      onLikeChange?.(post._id, {
        likedBy: updatedLikedBy,
        myReaction: updatedMyReaction,
        likes: res?.likes || res?.data?.likes,
      });
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
      setMyReaction(previousReaction);
      setLikedByList(previousLikedBy);
    }
  };

  const handleMainClick = () => {
    if (myReaction) {
      handleReact(null);
    } else {
      handleReact("love");
    }
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          if (!showReactions) {
            setShowReactions(true);
            return;
          }
          handleMainClick();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowReactions((prev) => !prev);
        }}
        className="inline-flex h-auto p-2 w-auto   text-muted-foreground hover:bg-transparent hover:text-muted-foreground  cursor-pointer"
      >
        {activeReaction ? (
          activeReaction.type === "love" ? (
            <Heart
              style={{ width: 20, height: 20 }}
              className="fill-current text-red-500 shrink-0"
            />
          ) : (
            <Heart style={{ width: 20, height: 20 }} />
          )
        ) : (
          <Heart style={{ width: 20, height: 20 }} />
        )}
      </Button>

      <div
        className={`
          absolute left-0 bottom-5 z-30 mb-2
          flex items-center gap-0.5
          overflow-visible
          rounded-full border border-slate-200 bg-white
          px-1.5 py-1 shadow-lg
          dark:border-slate-800 dark:bg-slate-950
          transition-all duration-150
          ${
            showReactions
              ? "opacity-100 pointer-events-auto translate-y-0"
              : "opacity-0 pointer-events-none translate-y-1"
          }
        `}
      >
        {REACTIONS.map((reaction) => (
          <button
            key={reaction.type}
            type="button"
            onClick={() => handleReact(reaction.type)}
            className="
              rounded-full
              p-1
              text-[20px]
              leading-none
              transition-transform duration-150
              hover:scale-115
            "
            title={reaction.label}
          >
            <span
              key={
                jumpReaction === reaction.type
                  ? `${reaction.type}-${jumpToken}`
                  : reaction.type
              }
              className={
                jumpReaction === reaction.type
                  ? "inline-block reaction-jump"
                  : "inline-block"
              }
            >
              {reaction.emoji}
            </span>
          </button>
        ))}
      </div>

      <style>{`
        .reaction-jump {
          animation: reactionJump 260ms ease-out;
        }

        @keyframes reactionJump {
          0% {
            transform: translateY(0) scale(1);
          }
          35% {
            transform: translateY(-28px) scale(1.35);
          }
          70% {
            transform: translateY(-14px) scale(1.15);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default PostLikeComponent;
