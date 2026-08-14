// components/Live/Viewer.jsx
// Watches a broadcaster's stream. Add comments/hearts overlays on top of
// this the same way you'd overlay them on any video element.

import {
  LiveKitRoom,
  VideoTrack,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function RemoteVideo() {
  // onlySubscribed: false isn't needed here — remote tracks ARE what
  // "subscribed" means, so the default already includes them. This is
  // only needed for LOCAL preview tracks (see Broadcaster.jsx).
  const tracks = useTracks([Track.Source.Camera]);
  const remoteTrack = tracks.find((t) => !t.participant.isLocal);

  if (!remoteTrack) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
        Connecting…
      </div>
    );
  }
  return (
    <VideoTrack trackRef={remoteTrack} className="h-full w-full object-cover" />
  );
}

export default function Viewer({ token, serverUrl, hostUsername, onLeave }) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect
      audio={false}
      video={false}
      onDisconnected={onLeave}
      className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-3xl bg-black"
    >
      <RemoteVideo />

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        @{hostUsername}
      </div>

      <Button
        size="icon"
        variant="secondary"
        className="absolute right-4 top-4 h-9 w-9 rounded-full bg-black/50 hover:bg-black/70"
        onClick={onLeave}
      >
        <X className="h-4 w-4 text-white" />
      </Button>

      {/* Live comments feed goes here — subscribe to your own realtime
          channel (Socket.io / SSE) keyed by the room name, separate from
          the video track itself. */}

      <Button
        size="icon"
        variant="secondary"
        className="absolute bottom-6 right-4 h-12 w-12 rounded-full bg-white/90 hover:bg-white"
      >
        <Heart className="h-5 w-5 text-rose-500" />
      </Button>
    </LiveKitRoom>
  );
}