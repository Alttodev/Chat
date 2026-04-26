import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, MoreHorizontal, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageViewer } from "../modals/imageViewer";
import { useImageModalStore } from "@/lib/zustand";

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getStatusIcon = (status) => {
  switch (status) {
    case "sent":
      return <Check className="w-3 h-3 text-muted-foreground" />;
    case "delivered":
      return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
    case "read":
      return <CheckCheck className="w-3 h-3 text-emerald-600" />;
    default:
      return null;
  }
};

export default function MessagesList({
  messages,
  messagesEndRef,
  currentUserId,
  isLoading,
  onDeleteMessage,
  deletingMessageId,
}) {
  const { open } = useImageModalStore();
  if (isLoading) {
    return (
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-60 ml-auto" />
          <Skeleton className="h-10 w-44" />
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4 ">
      <div className="space-y-4 ">
        {messages.map((message) => {
          const isOwnMessage =
            message?.sender?._id?.toString() === currentUserId?.toString();
          const status = isOwnMessage
            ? message?.seenBy?.length > 1
              ? "read"
              : "sent"
            : null;
          const hasOnlyImage = !!message.image && !message.text;
          const hasImageAndText = !!message.image && !!message.text;
          const isDeleted =
            !!message?.isDeleted ||
            !!message?.deleted ||
            !!message?.deletedAt ||
            message?.type === "deleted";
          const deletedText = message?.deletedText || "Message deleted";

          return (
            <div
              key={message._id || message.id}
              className={cn(
                "flex gap-3 max-w-[80%]",
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
                  className={cn(
                    "rounded-2xl max-w-md break-words relative",
                    hasOnlyImage || hasImageAndText
                      ? "bg-transparent p-0"
                      : isOwnMessage
                        ? "px-4 py-2 bg-emerald-600 text-white rounded-br-md"
                        : "px-4 py-2 bg-muted text-muted-foreground rounded-bl-md",
                  )}
                >
                  {isOwnMessage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <span className="absolute -top-2 -right-2 cursor-pointer bg-background rounded-full p-1 border">
                          <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onDeleteMessage?.(message)}
                          disabled={
                            deletingMessageId === message?._id ||
                            !message?._id ||
                            isDeleted
                          }
                          className="cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                          <span className="text-red-500">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {!isDeleted && message.image && (
                    <img
                      onClick={() => {
                        open(message.image);
                      }}
                      className={cn(
                        "rounded-md max-h-72 object-cover cursor-pointer hover:scale-[1.01] transition",
                        hasOnlyImage ? "" : "mb-2",
                      )}
                      src={message.image}
                      alt="post"
                    />
                  )}
                  {(message.text || isDeleted) && (
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        hasImageAndText &&
                          !isDeleted &&
                          "mt-2 px-4 py-2 rounded-2xl",
                        hasImageAndText &&
                          !isDeleted &&
                          (isOwnMessage
                            ? "bg-emerald-600 text-white rounded-br-md"
                            : "bg-muted text-muted-foreground rounded-bl-md"),
                        isDeleted && "italic text-muted-foreground",
                      )}
                    >
                      {isDeleted ? deletedText : message.text}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.createdAt || message.timestamp)}
                  </span>
                  {isOwnMessage && getStatusIcon(status)}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>
      <ImageViewer />
    </ScrollArea>
  );
}
