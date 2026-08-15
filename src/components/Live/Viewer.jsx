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
import { useLiveReactions } from "@/hooks/useLiveReactions";
import FloatingEmojis from "@/components/Live/FloatingEmojis";
import EmojiReactionBar from "@/components/Live/EmojiReactionbar";

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
  // Includes the broadcaster + every other viewer, so subtract 1 for the
  // broadcaster to show a count that matches what the broadcaster sees.
  const remoteParticipants = useRemoteParticipants();
  const count = Math.max(remoteParticipants.length - 1, 0);

  return (
    <div className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
      {count} watching
    </div>
  );
}

function ReactionsLayer() {
  const { reactions, sendReaction, removeReaction } = useLiveReactions();
  return (
    <>
      <FloatingEmojis reactions={reactions} onExpire={removeReaction} />
      <EmojiReactionBar onSend={sendReaction} />
    </>
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
      <RoomAudioRenderer />
      <ReactionsLayer />

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        @{hostUsername}
      </div>

      <ViewerCountBadge />

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