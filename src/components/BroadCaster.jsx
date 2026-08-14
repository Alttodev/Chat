// components/live/Broadcaster.jsx
// Requires: npm install livekit-client @livekit/components-react @livekit/components-styles
//
// Renders the camera preview + go-live controls once the user taps
// "Start live" on the Live page.

import { useState } from "react";
import {
  LiveKitRoom,
  VideoTrack,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic, MicOff, Video as VideoIcon, VideoOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function BroadcastControls({ onEnd }) {
  const { localParticipant } = useLocalParticipant();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const toggleMic = async () => {
    await localParticipant.setMicrophoneEnabled(!micOn);
    setMicOn(!micOn);
  };

  const toggleCam = async () => {
    await localParticipant.setCameraEnabled(!camOn);
    setCamOn(!camOn);
  };

  return (
    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
      <Button
        size="icon"
        variant="secondary"
        className="h-12 w-12 rounded-full bg-white/90 backdrop-blur hover:bg-white"
        onClick={toggleMic}
      >
        {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="h-12 w-12 rounded-full bg-white/90 backdrop-blur hover:bg-white"
        onClick={toggleCam}
      >
        {camOn ? (
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
  const tracks = useTracks([Track.Source.Camera]);
  const localTrack = tracks.find((t) => t.participant.isLocal);

  if (!localTrack) return null;
  return (
    <VideoTrack
      trackRef={localTrack}
      className="h-full w-full object-cover"
    />
  );
}

export default function Broadcaster({ token, serverUrl, onEnd }) {
  const [viewerCount] = useState(0);

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

      <div className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        {viewerCount} watching
      </div>

      <BroadcastControls onEnd={onEnd} />
    </LiveKitRoom>
  );
}