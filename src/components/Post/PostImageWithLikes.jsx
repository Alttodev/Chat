import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function PostImageWithLikes({ post, onImageClick, className }) {
  const navigate = useNavigate();
  const likeCount = typeof post?.likes === "number" ? post.likes : 0;
  const canOpenLikes = Boolean(post?._id);

  if (!post?.image) {
    return null;
  }

  const handleOpenLikes = (event) => {
    event.stopPropagation();

    if (!canOpenLikes) {
      return;
    }

    navigate(`/posts/${post._id}/liked-users`);
  };

  return (
    <div className={cn("relative group overflow-hidden rounded-lg", className)}>
      <img
        onClick={onImageClick}
        className="w-full h-auto object-cover rounded-lg cursor-pointer hover:scale-[1.01] transition-transform duration-300"
        src={post.image}
        alt="post"
      />

      {likeCount > 0 && (
        <button
          type="button"
          onClick={handleOpenLikes}
          className="absolute left-3 bottom-3 z-10 flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-2 py-2 shadow-xl backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:scale-[1.03] like-fly cursor-pointer"
          aria-label="Open liked users"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-teal-400 text-white shadow-md">
            <Heart className="h-5 w-5 fill-white text-white" />
            <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-white bg-emerald-600 px-1 text-[10px] font-bold leading-none text-white shadow">
              {likeCount > 99 ? "99+" : likeCount}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
