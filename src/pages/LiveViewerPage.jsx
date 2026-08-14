// pages/LiveViewerPage.jsx
// Route this at /live/:userId — LiveStoryBar already navigates here when
// someone taps a live badge.

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Viewer from "@/components/Live/Viewer";
import { useJoinLive } from "@/hooks/useJoinLive";

export default function LiveViewerPage() {
  const { userId } = useParams(); // the host's userId, from the URL
  const navigate = useNavigate();
  const { session, loading, error, joinLive, leaveLive } = useJoinLive();

  useEffect(() => {
    joinLive(userId).catch(() => {
      // joinLive already sets `error` — nothing else to do here
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleLeave = () => {
    leaveLive();
    navigate(-1); // back to wherever they came from (feed, Live page, etc.)
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center text-sm text-muted-foreground">
        Joining stream…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted-foreground underline"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="pb-6">
      <Viewer
        token={session.token}
        serverUrl={session.serverUrl}
        hostUsername={userId}
        onLeave={handleLeave}
      />
    </div>
  );
}