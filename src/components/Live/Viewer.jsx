// components/Live/Viewer.jsx
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useRemoteParticipants,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveComments } from "@/hooks/useLiveComments";
import WatchersList from "@/components/Live/WatchersList";
import CommentsPanel from "@/components/Live/CommentsPanel";

function RemoteVideo() {
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

function ViewerCountBadge() {
  const remoteParticipants = useRemoteParticipants();
  const count = Math.max(remoteParticipants.length - 1, 0);

  return (
    <div className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
      {count} watching
    </div>
  );
}

export default function Viewer({
  token,
  serverUrl,
  hostUsername,
  hostUserId,
  sessionId,
  onLeave,
}) {
  const { comments, postComment, posting } = useLiveComments(sessionId);

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
      <RoomAudioRenderer />

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        @{hostUsername}
      </div>

      <ViewerCountBadge />
      <WatchersList excludeIdentity={hostUserId} />

      <CommentsPanel comments={comments} onSend={postComment} posting={posting} />

      <Button
        size="icon"
        variant="secondary"
        className="absolute right-4 top-12 h-9 w-9 rounded-full bg-black/50 hover:bg-black/70"
        onClick={onLeave}
      >
        <X className="h-4 w-4 text-white" />
      </Button>
    </LiveKitRoom>
  );
}