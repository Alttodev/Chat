import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { toastError } from "@/lib/toast";
import { usePostBookmark } from "@/hooks/postHooks";

function PostBookmarkComponent({ post, className, onBookmarkChange }) {
  const { mutateAsync: postBookmark } = usePostBookmark();
  const [isBookmarked, setIsBookmarked] = useState(
    Boolean(post?.bookmarkedByMe),
  );

  useEffect(() => {
    setIsBookmarked(Boolean(post?.bookmarkedByMe));
  }, [post?._id, post?.bookmarkedByMe]);

  const handleBookmark = async (event) => {
    event.stopPropagation();

    if (!post?._id) return;

    const previousBookmarked = isBookmarked;
    const nextBookmarked = !previousBookmarked;

    setIsBookmarked(nextBookmarked);

    try {
      const res = await postBookmark({ id: post._id });
      const bookmarkedByMe =
        typeof res?.bookmarkedByMe === "boolean"
          ? res.bookmarkedByMe
          : typeof res?.data?.bookmarkedByMe === "boolean"
            ? res.data.bookmarkedByMe
            : nextBookmarked;

      setIsBookmarked(bookmarkedByMe);
      onBookmarkChange?.(post._id, {
        bookmarkedByMe,
        bookmarks: res?.bookmarks ?? res?.data?.bookmarks,
        bookmarkedBy: res?.bookmarkedBy ?? res?.data?.bookmarkedBy,
      });
    } catch (error) {
      setIsBookmarked(previousBookmarked);
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleBookmark}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full p-0 text-muted-foreground transition-colors duration-200 hover:bg-transparent cursor-pointer",
        isBookmarked
          ? "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-300"
          : "",
        className,
      )}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
      title={isBookmarked ? "Remove bookmark" : "Bookmark"}
    >
      <Bookmark
        style={{ width: 20, height: 20 }}
        className={`shrink-0 transition-transform duration-200 ease-out ${
          isBookmarked ? "fill-current text-amber-500 dark:text-amber-300" : ""
        }`}
      />
    </Button>
  );
}

export default PostBookmarkComponent;
