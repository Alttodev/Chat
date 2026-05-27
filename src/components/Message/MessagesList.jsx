import { useCallback, useEffect, useMemo, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Check,
  CheckCheck,
  CornerDownLeft,
  Forward,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageViewer } from "../modals/imageViewer";
import { useChatMessageMetaStore, useImageModalStore } from "@/lib/zustand";
import {
  getMessageMediaMimeType,
  getMessageMediaUrl,
  isAudioMediaUrl,
  isVideoMediaUrl,
} from "@/lib/media";

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getDayLabel = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusIcon = (status) => {
  switch (status) {
    case "sent":
      return <Check className="h-3 w-3 text-muted-foreground" />;
    case "delivered":
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    case "read":
      return <CheckCheck className="h-3 w-3 text-emerald-600" />;
    default:
      return null;
  }
};

const parseMessageLinks = (text) => {
  if (!text) return text;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, idx) => {
    if (part && part.match(/^https?:\/\//)) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-blue-400 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return <span key={idx}>{part}</span>;
  });
};

const getMessageReference = (message) => {
  const replySource =
    message?.replyTo ||
    message?.replyMessage ||
    message?.replyToMessage ||
    message?.quotedMessage ||
    null;

  if (replySource) {
    return {
      kind: "reply",
      message: replySource,
    };
  }

  const forwardedSource =
    message?.forwardedMessage ||
    message?.forwardedFromMessage ||
    message?.forwardedFrom ||
    null;

  if (forwardedSource) {
    return {
      kind: "forward",
      message: forwardedSource,
    };
  }

  return null;
};

const getMediaLabel = (message) => {
  const mediaUrl = getMessageMediaUrl(message);
  if (!mediaUrl) return "";

  const mediaType = getMessageMediaMimeType(message);
  const isAudio = isAudioMediaUrl(mediaUrl, mediaType);
  const isVideo = isVideoMediaUrl(mediaUrl, mediaType);

  if (isAudio) return "Audio";
  return isVideo ? "Video" : "Photo";
};

export default function MessagesList({
  messages,
  messagesEndRef,
  currentUserId,
  isLoading,
  onDeleteMessage,
  deletingMessageId,
  isOtherTyping,
  typingUserName,
  conversationId,
  onReplyMessage,
  onForwardMessage,
  replyTargetMessageId,
}) {
  const { open } = useImageModalStore();
  const messageMetaById = useChatMessageMetaStore(
    (state) => state.messageMetaById,
  );
  const viewportRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);
  const lastMessageIdRef = useRef(null);
  const highlightedReplyIdRef = useRef(null);
  let previousDayLabel = "";

  const scrollToBottom = useCallback((behavior = "smooth") => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior,
    });
  }, []);

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const distanceFromBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < 96;
  }, []);

  useEffect(() => {
    shouldStickToBottomRef.current = true;
    lastMessageIdRef.current = null;

    const frame = window.requestAnimationFrame(() => {
      scrollToBottom("auto");
    });

    return () => window.cancelAnimationFrame(frame);
  }, [conversationId, scrollToBottom]);

  useEffect(() => {
    if (!messages.length) return;

    const latestMessage = messages[messages.length - 1];
    const latestMessageId = latestMessage?._id || latestMessage?.id;
    if (!latestMessageId || latestMessageId === lastMessageIdRef.current) {
      return;
    }

    const isOwnLatestMessage =
      latestMessage?.sender?._id?.toString() === currentUserId?.toString();

    lastMessageIdRef.current = latestMessageId;

    if (shouldStickToBottomRef.current || isOwnLatestMessage) {
      const frame = window.requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [messages, currentUserId, scrollToBottom]);

  useEffect(() => {
    if (!replyTargetMessageId) return;

    const targetId = replyTargetMessageId?.toString?.();
    if (!targetId || highlightedReplyIdRef.current === targetId) return;

    highlightedReplyIdRef.current = targetId;

    const frame = window.requestAnimationFrame(() => {
      const element = viewportRef.current?.querySelector?.(
        `[data-message-id="${targetId}"]`,
      );

      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [replyTargetMessageId]);

  const renderedMessages = useMemo(() => messages || [], [messages]);

  const TypingBubble = () => (
    <div className="flex max-w-[80%] gap-3">
      <div className="flex flex-col items-start gap-1">
        <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2 text-muted-foreground shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">
              {typingUserName || "Typing"}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <ScrollArea className="flex-1 min-h-0" viewportClassName="p-4 sm:p-5">
        <div className="space-y-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="ml-auto h-10 w-60" />
          <Skeleton className="h-10 w-44" />
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea
      className="flex-1 min-h-0"
      viewportRef={viewportRef}
      onViewportScroll={handleScroll}
      viewportClassName="h-full p-3 sm:p-5"
    >
      <div className="space-y-4">
        {renderedMessages.map((message) => {
          const localMeta =
            messageMetaById?.[message?._id || message?.id] || null;
          const normalizedMessage = {
            ...message,
            ...(localMeta?.replyToMessage
              ? { replyToMessage: localMeta.replyToMessage }
              : {}),
            ...(localMeta?.forwardedMessage
              ? { forwardedMessage: localMeta.forwardedMessage }
              : {}),
          };
          const dayLabel = getDayLabel(message.createdAt || message.timestamp);
          const messageReference = getMessageReference(normalizedMessage);
          const showDaySeparator = dayLabel && dayLabel !== previousDayLabel;
          const isOwnMessage =
            normalizedMessage?.sender?._id?.toString() ===
            currentUserId?.toString();
          const mediaUrl = getMessageMediaUrl(normalizedMessage);
          const mediaType = getMessageMediaMimeType(normalizedMessage);
          const isAudioMessage =
            !!normalizedMessage?.audio ||
            mediaType.startsWith("audio/") ||
            isAudioMediaUrl(mediaUrl, mediaType);
          const isVideoMessage =
            !isAudioMessage && isVideoMediaUrl(mediaUrl, mediaType);
          const status = isOwnMessage
            ? normalizedMessage?.seenBy?.length > 1
              ? "read"
              : "sent"
            : null;
          const hasOnlyVisualMedia =
            !!mediaUrl && !normalizedMessage.text && !isAudioMessage;
          const hasImageAndText = !!mediaUrl && !!normalizedMessage.text;
          const isDeleted =
            !!normalizedMessage?.isDeleted ||
            !!normalizedMessage?.deleted ||
            !!normalizedMessage?.deletedAt ||
            normalizedMessage?.type === "deleted";
          const deletedText =
            normalizedMessage?.deletedText || "Message deleted";
          const isReplyTarget =
            replyTargetMessageId &&
            replyTargetMessageId?.toString?.() ===
              (normalizedMessage?._id || normalizedMessage?.id)?.toString?.();
          const quotedMessage =
            normalizedMessage?.replyToMessage ||
            normalizedMessage?.replyTo ||
            normalizedMessage?.replyMessage ||
            normalizedMessage?.quotedMessage ||
            null;
          const quotedSenderId =
            quotedMessage?.sender?._id ||
            quotedMessage?.sender?.id ||
            quotedMessage?.user?._id ||
            quotedMessage?.user?.id ||
            null;
          const replyAuthorName =
            quotedSenderId &&
            quotedSenderId?.toString?.() === currentUserId?.toString()
              ? "You"
              : quotedMessage?.sender?.userName ||
                quotedMessage?.sender?.name ||
                quotedMessage?.user?.userName ||
                quotedMessage?.user?.name ||
                (isOwnMessage ? "You" : "Reply");
          previousDayLabel = dayLabel;

          return (
            <div key={normalizedMessage._id || normalizedMessage.id}>
              {showDaySeparator ? (
                <div className="flex items-center gap-3 py-2">
                  <span className="h-px flex-1 bg-border/70 dark:bg-white/10" />
                  <span className="inline-flex items-center rounded-full border border-border bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/90 dark:text-slate-300">
                    {dayLabel}
                  </span>
                  <span className="h-px flex-1 bg-border/70 dark:bg-white/10" />
                </div>
              ) : null}

              <div
                className={cn(
                  "group flex max-w-[86%] items-end gap-2 sm:max-w-[76%]",
                  isOwnMessage ? "ml-auto flex-row-reverse" : "",
                )}
              >
                <div
                  className={cn(
                    "flex flex-col gap-1",
                    isOwnMessage ? "items-end" : "items-start",
                  )}
                >
                  <div
                    data-message-id={(
                      normalizedMessage._id || normalizedMessage.id
                    )?.toString?.()}
                    className={cn(
                      "relative w-fit max-w-full overflow-hidden rounded-2xl border break-words whitespace-pre-wrap shadow-sm transition-transform duration-200",
                      isReplyTarget &&
                        "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background shadow-lg shadow-emerald-500/10",
                      messageReference?.kind === "reply" &&
                        "bg-[#fefbf5] border-[#ddd6ca] dark:bg-[#182229] dark:border-[#2c3a43]",
                      hasOnlyVisualMedia || hasImageAndText
                        ? "border-transparent bg-transparent p-0 shadow-none"
                        : isOwnMessage
                          ? "border-[#b6d7a8] bg-[#dcf8c6] px-4 py-2 text-slate-900 rounded-br-md dark:border-[#005c4b] dark:bg-[#005c4b] dark:text-white"
                          : "border-[#e0e0e0] bg-white px-4 py-2 text-slate-900 rounded-bl-md dark:border-[#26333d] dark:bg-[#202c33] dark:text-slate-100",
                    )}
                  >
                    {!isDeleted &&
                      messageReference &&
                      messageReference.kind === "reply" && (
                        <div className="mb-2 rounded-xl border-l-4 border-emerald-500 bg-black/5 px-3 py-2 text-left shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:bg-white/5">
                          <p className="text-[12px] font-semibold leading-none text-slate-700 dark:text-slate-200">
                            {replyAuthorName}
                          </p>
                          <p className="mt-1 line-clamp-2 text-[15px] leading-5 text-slate-900 dark:text-slate-100">
                            {messageReference?.message?.text ||
                              getMediaLabel(messageReference?.message)}
                          </p>
                        </div>
                      )}

                    {!isDeleted &&
                      messageReference &&
                      messageReference.kind === "forward" && (
                        <div className="mb-2 text-left">
                          <p className="mb-1 flex items-center gap-1.5 text-[11px] italic font-medium leading-none text-muted-foreground/80">
                            <Forward className="h-3 w-3 shrink-0" />
                            <span>Forwarded</span>
                          </p>
                        </div>
                      )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="absolute right-0 -top-0 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/70 opacity-100 transition-all duration-200 hover:bg-black/5 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25 sm:opacity-0 sm:group-hover:opacity-100 dark:hover:bg-white/10 dark:hover:text-slate-100 cursor-pointer"
                          aria-label="Message actions"
                          title="Message actions"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={8}>
                        <DropdownMenuItem
                          onClick={() => onReplyMessage?.(normalizedMessage)}
                          className="cursor-pointer"
                        >
                          <CornerDownLeft className="mr-2 h-4 w-4 text-emerald-600" />
                          <span>Reply</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onForwardMessage?.(normalizedMessage)}
                          className="cursor-pointer"
                        >
                          <Forward className="mr-2 h-4 w-4 text-emerald-600" />
                          <span>Forward</span>
                        </DropdownMenuItem>
                        {isOwnMessage && (
                          <DropdownMenuItem
                            onClick={() => onDeleteMessage?.(normalizedMessage)}
                            disabled={
                              deletingMessageId === message?._id ||
                              !message?._id ||
                              isDeleted
                            }
                            className="cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                            <span className="text-red-500">Delete</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {!isDeleted &&
                      mediaUrl &&
                      !isVideoMessage &&
                      !isAudioMessage && (
                        <img
                          onClick={() => open(mediaUrl)}
                          className={cn(
                            "max-h-72 w-full cursor-pointer rounded-2xl object-cover transition hover:scale-[1.01]",
                            hasOnlyVisualMedia ? "" : "mb-2",
                          )}
                          src={mediaUrl}
                          alt="message media"
                        />
                      )}
                    {!isDeleted &&
                      mediaUrl &&
                      isVideoMessage && (
                        <video
                          src={mediaUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className={cn(
                            "max-h-72 w-full rounded-2xl bg-black object-contain",
                            hasOnlyVisualMedia ? "" : "mb-2",
                          )}
                        />
                      )}
                    {!isDeleted &&
                      mediaUrl &&
                      isAudioMessage && (
                          <audio
                            src={mediaUrl}
                            controls
                            preload="metadata"
                            className="w-full min-w-[220px]"
                          />
                      )}
                    {(normalizedMessage.text || isDeleted) && (
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          hasImageAndText &&
                            !isDeleted &&
                            "mt-2 rounded-2xl px-4 py-2",
                          hasImageAndText &&
                            !isDeleted &&
                            (isOwnMessage
                              ? "bg-[#cbeeb0] text-slate-900 dark:bg-[#004f43] dark:text-white"
                              : "bg-[#f5f5f5] text-slate-900 dark:bg-[#26333d] dark:text-slate-100"),
                          messageReference?.kind === "reply" &&
                            !hasImageAndText &&
                            !hasOnlyVisualMedia &&
                            "mt-0 text-[15px] leading-6",
                          isDeleted && "italic text-muted-foreground",
                        )}
                      >
                        {isDeleted
                          ? deletedText
                          : parseMessageLinks(normalizedMessage.text)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(
                        normalizedMessage.createdAt ||
                          normalizedMessage.timestamp,
                      )}
                    </span>
                    {isOwnMessage && getStatusIcon(status)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isOtherTyping ? <TypingBubble /> : null}

        <div ref={messagesEndRef} />
      </div>
      <ImageViewer />
    </ScrollArea>
  );
}
