import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import Broadcaster from "@/components/BroadCaster";
import { useBroadcast } from "@/hooks/useBroadCast";
import LiveStoryBar from "@/components/Live/LiveStoryBar";

export default function Live() {
  const { session, loading, error, startLive, endLive } = useBroadcast();

  if (session) {
    const hostUserId = session.roomName?.replace("live-", "");

    return (
      <div className="space-y-4 pb-6">
        <LiveStoryBar />
        <Broadcaster
          token={session.token}
          serverUrl={session.serverUrl}
          hostUserId={hostUserId}
          sessionId={session.sessionId}
          onEnd={endLive}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-2 px-4 py-3">
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-white p-3 shadow-sm">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Radio className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Go live</p>
          <p className="text-xs text-muted-foreground">
            Share what you're doing right now
          </p>
        </div>

        <Button
          disabled={loading}
          onClick={startLive}
          className="h-auto flex-shrink-0 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
        >
          {loading ? "Starting…" : "Start"}
        </Button>
      </div>

      {error && <p className="px-1 text-sm text-red-600">{error}</p>}

      <LiveStoryBar />
    </div>
  );
}