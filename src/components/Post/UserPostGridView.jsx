import { useNavigate } from "react-router-dom";
import { isVideoMediaUrl } from "@/lib/media";
import { Copy, Play } from "lucide-react";

export function UserPostGridView({ posts, userId }) {
  const navigate = useNavigate();

  if (!posts.length) {
    return (
      <div className="flex justify-center py-10">
        <span className="text-sm text-muted-foreground">No posts yet</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-[2px]">
      {posts.map((post) => {
        const images = Array.isArray(post?.image)
          ? post.image
          : post?.image
            ? [post.image]
            : [];

        const firstMedia = images[0];
        const isVideo = isVideoMediaUrl(firstMedia);
        const isMultiple = images.length > 1;

        if (!firstMedia) return null;

        return (
          <button
            key={post._id}
            onClick={() => navigate(`/user/${userId}/posts/${post._id}`)}
            className="relative aspect-square w-full overflow-hidden group focus:outline-none cursor-pointer"
          >
            {/* Thumbnail */}
            {isVideo ? (
              <video
                src={firstMedia}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
            ) : (
              <img
                src={firstMedia}
                alt="post"
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            )}

            {/* Indicators */}
            <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
              {isVideo && (
                <div className="text-white drop-shadow">
                  <Play className="h-4 w-4 fill-white" />
                </div>
              )}
              {isMultiple && (
                <div className="text-white drop-shadow">
                  <Copy className="h-4 w-4 fill-white/80 text-white" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}