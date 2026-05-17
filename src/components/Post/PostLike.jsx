import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import { toastError } from "@/lib/toast";
import { usePostLike } from "@/hooks/postHooks";
import { Link } from "react-router-dom";

function PostLikeComponent({ post, onLikeChange }) {
  const { mutateAsync: postLike } = usePostLike();

  const [isLiked, setIsLiked] = useState(Boolean(post?.likedByMe));
  const [likeCount, setLikeCount] = useState(post?.likes || 0);

  useEffect(() => {
    setIsLiked(Boolean(post?.likedByMe));
    setLikeCount(post?.likes || 0);
  }, [post?.likedByMe, post?.likes]);

  const handleLike = async () => {
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likeCount + 1 : likeCount - 1;

    setIsLiked(nextLiked);
    setLikeCount(nextCount);

    try {
      const res = await postLike(post._id);

      const updatedLikes = res?.data?.likes;
      const updatedLikedBy = res?.data?.likedBy;

      if (typeof updatedLikes === "number") {
        setLikeCount(updatedLikes);
      }

      if (Array.isArray(updatedLikedBy)) {
        const me = updatedLikedBy.some((like) => {
          const id = like?.user?._id || like?.user || like?.userId;
          return String(id) === String(post?.currentUserId);
        });

        setIsLiked(me);
      }

      onLikeChange?.(post._id, {
        likes: res?.data?.likes,
        likedBy: res?.data?.likedBy,
      });
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
      setIsLiked(!nextLiked);
      setLikeCount(likeCount);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className="h-9 w-9 cursor-pointer p-0 text-muted-foreground hover:bg-transparent"
        aria-label={`${isLiked ? "Unlike" : "Like"} post`}
      >
        <Heart
          className={isLiked ? "heart-animate" : ""}
          style={{
            width: 18,
            height: 18,
            fill: isLiked ? "#10b981" : "none",
            stroke: isLiked ? "#10b981" : "currentColor",
          }}
        />
      </Button>

      {likeCount > 0 && (
        <Link
          to={`/posts/${post._id}/liked-users`}
          className="text-sm font-medium text-slate-700 transition-colors duration-200 hover:text-emerald-600"
        >
          {likeCount} {likeCount === 1 ? "Like" : "Likes"}
        </Link>
      )}
    </div>
  );
}

export default PostLikeComponent;
