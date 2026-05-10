import React, { useState } from "react";
import { Heart } from "lucide-react";
import { usePostLike } from "@/hooks/postHooks";
import { Button } from "../ui/button";
import { toastError } from "@/lib/toast";

function PostLikeComponent({ post, userId }) {
  const { mutateAsync: postLike } = usePostLike(userId);

  const [isLiked, setIsLiked] = useState(post.likedByMe);

  const handleLike = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);

    try {
      await postLike(post._id);
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
      setIsLiked(!newLiked);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      className="h-9 w-9 p-0 text-muted-foreground hover:bg-transparent cursor-pointer"
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
  );
}

export default PostLikeComponent;
