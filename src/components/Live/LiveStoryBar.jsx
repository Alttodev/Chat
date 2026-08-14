// components/feed/LiveStoryBar.jsx
// Example of where useActiveLive actually gets called — drop this at the
// top of your Home/Feed page, above the regular story avatars.

import { useActiveLive } from "@/hooks/useActiveLive";
import { useNavigate } from "react-router-dom"; // swap for your router

export default function LiveStoryBar() {
  const { activeUsers, loading } = useActiveLive();
  const navigate = useNavigate();

  if (loading || activeUsers.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto px-4 py-3">
      {activeUsers.map((user) => (
        <button
          key={user.userId}
          onClick={() => navigate(`/live/${user.userId}`)}
          className="flex flex-col items-center gap-1"
        >
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-16 w-16 rounded-full border-2 border-red-500 object-cover"
            />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
              Live
            </span>
          </div>
          <span className="max-w-[64px] truncate text-xs text-foreground">
            {user.username}
          </span>
        </button>
      ))}
    </div>
  );
}