import React, { useState } from "react";
import { Heart } from "lucide-react";
import { usePostLike } from "@/hooks/postHooks";
import { Button } from "../ui/button";
import { toastError } from "@/lib/toast";

function PostLikeComponent({ post, userId }) {
  const { mutateAsync: postLike } = usePostLike(userId);

  const [isLiked, setIsLiked] = useState(post.likedByMe);
  const [likes, setLikes] = useState(post?.likes || 0);

  const handleLike = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);

    try {
      const res = await postLike(post._id);
      setLikes(res.likes);
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
      setIsLiked(!newLiked);
    }
  };

  return (
    <div className="flex-1 flex justify-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className="text-xs sm:text-sm text-muted-foreground hover:bg-transparent cursor-pointer"
      >
        <Heart
          style={{
            width: 16,
            height: 16,
            fill: isLiked ? "#10b981" : "none",
            stroke: isLiked ? "#10b981" : "currentColor",
          }}
        />
        {likes}
      </Button>
    </div>
  );
}

export default PostLikeComponent;
