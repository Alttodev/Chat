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
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className="flex-1 text-xs sm:text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
      >
        <Heart
          style={{
            width: 16,
            height: 16,
            marginRight: 6,
            fill: isLiked ? "red" : "none",
            stroke: isLiked ? "red" : "currentColor",
          }}
        />
        {likes}
      </Button>
    </>
  );
}

export default PostLikeComponent;
