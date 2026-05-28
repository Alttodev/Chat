import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { X, ImagePlus, Send, CornerDownLeft, Mic } from "lucide-react";
import AudioRecorder from "@/components/Message/AudioRecorder";

export default function MessageInput({
  newMessage,
  setNewMessage,
  handleSendMessage,
  selectedFile,
  onFileChange,
  isSending,
  isBlocked,
  blockedByMe,
  replyToMessage,
  onCancelReply,
}) {
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const isAudioAttachment = !!selectedFile?.type?.startsWith("audio/");
  const attachmentUrl = useMemo(() => {
    if (!selectedFile) return "";
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  const placeholder = blockedByMe
    ? "You blocked this user"
    : isBlocked
      ? "User blocked you"
      : "Write a message...";

  useEffect(() => {
    inputRef.current?.focus?.();
  }, [replyToMessage]);

  useEffect(() => {
    if (!attachmentUrl) return undefined;

    return () => {
      URL.revokeObjectURL(attachmentUrl);
    };
  }, [attachmentUrl]);

  const handleRemoveFile = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (isBlocked) return;
      handleSendMessage();
    }
  };

  return (
    <div className="shrink-0 border-t border-border/60 bg-background/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:px-4">
      {replyToMessage && (
        <div className="relative mb-3 rounded-[18px] border-l-4 border-emerald-500/80 bg-[#fdfcf8] px-4 py-3 dark:bg-[#1f2a30]">
          <p className="text-[11px] font-semibold leading-none text-emerald-700/90 dark:text-emerald-300/90">
            {replyToMessage?.sender?.userName || "You"}
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-700 dark:text-slate-200">
            {replyToMessage?.text ||
              (replyToMessage?.image ? "Media message" : "Message")}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 shrink-0"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {selectedFile && isAudioAttachment ? (
        <div className="mb-3 rounded-[18px] border border-emerald-500/15 bg-[#fdfcf8] p-3 shadow-sm dark:bg-[#1f2a30]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <Mic className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Voice note
              </p>
              <audio controls src={attachmentUrl} className="mt-2 w-full" />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-border/70 bg-card/90 p-2 shadow-sm">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 cursor-pointer rounded-full"
            type="button"
            disabled={isBlocked}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4 text-emerald-600" />
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,audio/*"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          />

          <div className="min-h-12 flex-1 rounded-2xl bg-muted/30 px-1">
            <Textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className="min-h-12 max-h-32 resize-none border-0 bg-transparent px-3 py-3 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-0 no-scrollbar"
              disabled={isBlocked}
            />
          </div>

          <AudioRecorder
            disabled={isBlocked || isSending}
            onRecordedAudio={(file) => onFileChange(file)}
          />

          <Button
            onClick={handleSendMessage}
            disabled={
              isBlocked || (!newMessage.trim() && !selectedFile) || isSending
            }
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
          <span className="text-xs text-muted-foreground">
            {newMessage.length}/1000
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {selectedFile ? (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 rounded-full bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300"
              >
                <span className="max-w-[120px] truncate">
                  {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="rounded-full bg-muted text-xs text-muted-foreground"
              >
                <CornerDownLeft className="mr-1 h-3 w-3" />
                Press Enter to send
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
