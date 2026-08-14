import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import Broadcaster from "@/components/BroadCaster";
import { useBroadcast } from "@/hooks/useBroadCast";
import LiveStoryBar from "@/components/Live/LiveStoryBar";

export default function Live() {
  const { session, loading, error, startLive, endLive } = useBroadcast();

  if (session) {
    return (
      <div className="pb-6">
        <LiveStoryBar />
        <Broadcaster
          token={session.token}
          serverUrl={session.serverUrl}
          onEnd={endLive}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 pb-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-gradient-to-br from-emerald-500/10 via-white to-sky-500/10 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Radio className="h-6 w-6" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Live now
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              Start a live session
            </h1>
          </div>
        </div>

        <Button
          disabled={loading}
          onClick={startLive}
          className="h-12 rounded-full bg-emerald-600 px-6 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500"
        >
          {loading ? "Starting…" : "Start live"}
        </Button>
      </div>

      {error && <p className="px-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}