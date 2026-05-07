import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function PostImageWithLikes({
  post,
  onImageClick,
  className,
  likedUsers,
}) {
  const navigate = useNavigate();
  const likeCount = typeof post?.likes === "number" ? post.likes : 0;
  const hasLiked = likedUsers?.[0]?.profileImage;

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
        <>
          <Avatar
            onClick={handleOpenLikes}
            className="absolute left-3 bottom-3 z-10 w-13 h-13 text-emerald-600 shadow-xl backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:scale-[1.03] like-fly cursor-pointer"
          >
            <AvatarImage
              className="absolute inset-0 w-full h-full object-cover object-top cursor-pointer"
              src={hasLiked || "/placeholder.svg"}
            />

            <Heart
              className="absolute bottom-1 right-1 h-4 w-4"
              style={{
                fill: "#10b981",
                stroke: "#10b981",
              }}
            />

            <AvatarFallback className="absolute inset-0 flex items-center justify-center">
              {post?.user?.userName?.charAt(0).toUpperCase() || "-"}
            </AvatarFallback>
          </Avatar>
        </>
      )}
    </div>
  );
}
