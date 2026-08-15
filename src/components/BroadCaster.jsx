// components/BroadCaster.jsx
import { useState } from "react";
import {
  LiveKitRoom,
  VideoTrack,
  useLocalParticipant,
  useRemoteParticipants,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic, MicOff, Video as VideoIcon, VideoOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveReactions } from "@/hooks/useLiveReactions";
import FloatingEmojis from "@/components/Live/FloatingEmojis";

function BroadcastControls({ onEnd }) {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } =
    useLocalParticipant();
  const [busy, setBusy] = useState(false);

  const toggleMic = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (err) {
      console.error("Mic toggle failed:", err);
    } finally {
      setBusy(false);
    }
  };

  const toggleCam = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (err) {
      console.error("Camera toggle failed:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
      <Button
        size="icon"
        variant="secondary"
        disabled={busy}
        className="h-12 w-12 rounded-full bg-white/90 backdrop-blur hover:bg-white cursor-pointer"
        onClick={toggleMic}
      >
        {isMicrophoneEnabled ? (
          <Mic className="h-5 w-5" />
        ) : (
          <MicOff className="h-5 w-5" />
        )}
      </Button>
      <Button
        size="icon"
        variant="secondary"
        disabled={busy}
        className="h-12 w-12 rounded-full bg-white/90 backdrop-blur hover:bg-white cursor-pointer"
        onClick={toggleCam}
      >
        {isCameraEnabled ? (
          <VideoIcon className="h-5 w-5" />
        ) : (
          <VideoOff className="h-5 w-5" />
        )}
      </Button>
      <Button
        size="icon"
        className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-500 cursor-pointer"
        onClick={onEnd}
      >
        <X className="h-5 w-5 text-white" />
      </Button>
    </div>
  );
}

function LocalPreview() {
  // onlySubscribed: false — local tracks never go through "subscription",
  // so the default (true) filters them out and the preview stays blank.
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  const localTrack = tracks.find((t) => t.participant.isLocal);

  if (!localTrack) return null;
  return (
    <VideoTrack trackRef={localTrack} className="h-full w-full object-cover" />
  );
}

function ViewerCountBadge() {
  // Remote participants = everyone in the room except the broadcaster
  // themself, which is exactly "who's watching". This updates live as
  // people join/leave, unlike a DB counter that only ever increments.
  const remoteParticipants = useRemoteParticipants();

  return (
    <div className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
      {remoteParticipants.length} watching
    </div>
  );
}

function ReactionsOverlay() {
  const { reactions, removeReaction } = useLiveReactions();
  return <FloatingEmojis reactions={reactions} onExpire={removeReaction} />;
}

export default function Broadcaster({ token, serverUrl, onEnd }) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect
      video
      audio
      onDisconnected={onEnd}
      className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-3xl bg-black"
    >
      <LocalPreview />
      <ReactionsOverlay />

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        Live
      </div>

      <ViewerCountBadge />

      <BroadcastControls onEnd={onEnd} />
    </LiveKitRoom>
  );
}