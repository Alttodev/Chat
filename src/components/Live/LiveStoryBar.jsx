import { useActiveLive } from "@/hooks/useActiveLive";
import { useNavigate } from "react-router-dom";
import { Radio } from "lucide-react";
import { useState, useEffect } from "react";
import live from "@/assets/live_image.png";

export default function LiveStoryBar() {
  const { activeUsers, loading } = useActiveLive();
  const navigate = useNavigate();
  const [showPoster, setShowPoster] = useState(false);

  useEffect(() => {
    if (!loading && activeUsers.length === 0) {
      const timer = setTimeout(() => setShowPoster(true), 250);
      return () => clearTimeout(timer);
    }

    setShowPoster(false);
  }, [loading, activeUsers.length]);

  if (activeUsers.length === 0) {
    return (
      <>
        {!showPoster ? (
          <div className="flex h-28 w-full items-center justify-center ">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              Loading...
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
            <img
              src={live}
              alt="No live users"
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {activeUsers.map((user) => (
        <button
          key={user.userId}
          onClick={() => navigate(`/live/${user.userId}`)}
          className="flex items-center gap-3 rounded-2xl border border-border/60 bg-white p-3 text-left shadow-sm transition hover:border-red-200 hover:shadow-md"
        >
          <div className="relative flex-shrink-0">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-12 w-12 rounded-full border-2 border-red-500 object-cover"
            />
            <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
              <Radio className="h-2 w-2" />
              Live
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-md font-semibold text-foreground">
              {user.username}
            </p>
            <p className="text-sm text-muted-foreground">is live now</p>
          </div>

          <span className="flex-shrink-0 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white cursor-pointer">
            Join
          </span>
        </button>
      ))}
    </div>
  );
}
