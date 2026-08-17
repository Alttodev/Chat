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
import { useLiveComments } from "@/hooks/useLiveComments";
import WatchersList from "@/components/Live/WatchersList";
import CommentsPanel from "@/components/Live/CommentsPanel";

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
    <div className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
      <Button
        size="icon"
        variant="secondary"
        disabled={busy}
        className="h-12 w-12 rounded-full bg-white/90 backdrop-blur hover:bg-white"
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
        className="h-12 w-12 rounded-full bg-white/90 backdrop-blur hover:bg-white"
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
        className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-500"
        onClick={onEnd}
      >
        <X className="h-5 w-5 text-white" />
      </Button>
    </div>
  );
}

function LocalPreview() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  const localTrack = tracks.find((t) => t.participant.isLocal);

  if (!localTrack) return null;
  return (
    <VideoTrack trackRef={localTrack} className="h-full w-full object-cover" />
  );
}

function ViewerCountBadge() {
  const remoteParticipants = useRemoteParticipants();

  return (
    <div className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
      {remoteParticipants.length} watching
    </div>
  );
}

export default function Broadcaster({ token, serverUrl, hostUserId, sessionId, onEnd }) {
  const { comments, postComment, posting } = useLiveComments(sessionId);

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

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        Live
      </div>

      <ViewerCountBadge />
      <WatchersList excludeIdentity={hostUserId} />

      <CommentsPanel comments={comments} onSend={postComment} posting={posting} />

      <BroadcastControls onEnd={onEnd} />
    </LiveKitRoom>
  );
}