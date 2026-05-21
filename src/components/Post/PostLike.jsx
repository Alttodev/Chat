import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import { toastError } from "@/lib/toast";
import { usePostLike } from "@/hooks/postHooks";

function PostLikeComponent({ post, onLikeChange }) {
  const { mutateAsync: postLike } = usePostLike();

  const [likedByList, setLikedByList] = useState(
    Array.isArray(post?.likedBy) ? post.likedBy : [],
  );
  const [isLiked, setIsLiked] = useState(
    !!post?.likedByMe || post?.myReaction === "love",
  );
  const [animateHeart, setAnimateHeart] = useState(false);

  useEffect(() => {
    setLikedByList(Array.isArray(post?.likedBy) ? post.likedBy : []);
    setIsLiked(!!post?.likedByMe || post?.myReaction === "love");
  }, [post?.likedBy, post?.likedByMe, post?.myReaction]);

  const handleLike = async () => {
    const previousLiked = isLiked;
    const previousLikedBy = likedByList;
    const nextLiked = !previousLiked;

    setIsLiked(nextLiked);

    setAnimateHeart(true);
    setTimeout(() => {
      setAnimateHeart(false);
    }, 300);

    try {
      const res = await postLike({
        id: post._id,
        type: nextLiked ? "love" : null,
      });

      const updatedLikedBy = res?.likedBy || res?.data?.likedBy;

      if (Array.isArray(updatedLikedBy)) {
        setLikedByList(updatedLikedBy);
      }

      onLikeChange?.(post._id, {
        likedBy: updatedLikedBy,
        myReaction: nextLiked ? "love" : null,
        likedByMe: nextLiked,
        likes: res?.likes || res?.data?.likes,
      });
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
      setIsLiked(previousLiked);
      setLikedByList(previousLikedBy);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleLike}
      className="inline-flex h-10 w-10 items-center justify-center p-0 text-muted-foreground hover:bg-transparent hover:text-muted-foreground cursor-pointer"
      aria-label={isLiked ? "Unlike post" : "Like post"}
      title={isLiked ? "Unlike" : "Like"}
    >
      <Heart
        style={{ width: 20, height: 20 }}
        className={`
          shrink-0
          transition-transform duration-200 ease-out
          ${isLiked ? "fill-current text-red-500" : ""}
          ${animateHeart ? "scale-125" : "scale-100"}
        `}
      />
    </Button>
  );
}

export default PostLikeComponent;
