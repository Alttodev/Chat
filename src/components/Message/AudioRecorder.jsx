import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toastError } from "@/lib/toast";
import { Mic, Square, Trash2 } from "lucide-react";

const formatDuration = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const getPreferredMimeType = () => {
  if (typeof MediaRecorder === "undefined") return "";

  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
};

const getFileExtension = (mimeType = "") => {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("webm")) return "webm";
  return "webm";
};

export default function AudioRecorder({
  disabled,
  onRecordedAudio,
  onRecordingStateChange,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const discardRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const resetRecordingState = () => {
    clearTimer();
    stopStream();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    discardRef.current = false;
    setIsRecording(false);
    setElapsedMs(0);
    onRecordingStateChange?.(false);
  };

  useEffect(() => {
    return () => {
      clearTimer();
      stopStream();
    };
  }, []);

  const startRecording = async () => {
    if (disabled || isRecording) return;

    if (!navigator?.mediaDevices?.getUserMedia) {
      toastError("Your browser does not support microphone recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      discardRef.current = false;

      const mimeType = getPreferredMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (!discardRef.current && blob.size > 0) {
          const fileName = `voice-note-${Date.now()}.${getFileExtension(
            blob.type,
          )}`;
          const audioFile = new File([blob], fileName, {
            type: blob.type || "audio/webm",
          });
          onRecordedAudio?.(audioFile);
        }

        resetRecordingState();
      };

      recorder.start();
      setIsRecording(true);
      onRecordingStateChange?.(true);
      setElapsedMs(0);

      timerRef.current = window.setInterval(() => {
        setElapsedMs((value) => value + 1000);
      }, 1000);
    } catch (error) {
      resetRecordingState();
      toastError(
        error?.name === "NotAllowedError"
          ? "Microphone access was denied."
          : "Could not start audio recording.",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    clearTimer();
    stopStream();
  };

  const discardRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      discardRef.current = true;
      mediaRecorderRef.current.stop();
      return;
    }

    resetRecordingState();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2  px-2 py-1  transition-all",
        isRecording
          ? "border-red-500/20 bg-red-500/5"
          : "border-border/70 bg-background/90",
      )}
    >
      {!isRecording ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:bg-red-500/10 hover:text-red-600 cursor-pointer"
          onClick={startRecording}
          disabled={disabled}
          aria-label="Record audio"
          title="Record audio"
        >
          <Mic className="h-4 w-4" />
        </Button>
      ) : (
        <>
          <span className="flex items-center gap-2 px-2 text-xs font-medium text-red-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            {formatDuration(elapsedMs)}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
            onClick={discardRecording}
            aria-label="Discard recording"
            title="Discard recording"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-red-600 hover:bg-red-500/10 hover:text-red-700"
            onClick={stopRecording}
            aria-label="Stop recording"
            title="Stop recording"
          >
            <Square className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
