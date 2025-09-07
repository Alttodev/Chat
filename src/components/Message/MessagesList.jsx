import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

const formatTime = (date) =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

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
  isTyping,
  selectedContact,
  messagesEndRef,
}) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 max-w-[80%]",
              message.sender === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage
                src={message.senderAvatar || "/placeholder.svg"}
                alt={message.senderName}
              />
              <AvatarFallback>
                {message.senderName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "flex flex-col gap-1",
                message.sender === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "px-4 py-2 rounded-2xl max-w-md break-words",
                  message.sender === "user"
                    ? "bg-emerald-600 text-white rounded-br-md"
                    : "bg-muted text-muted-foreground rounded-bl-md"
                )}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {formatTime(message.timestamp)}
                </span>
                {message.sender === "user" &&
                  getStatusIcon(message.status)}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-[80%]">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage
                src={selectedContact.avatar || "/placeholder.svg"}
                alt={selectedContact.name}
              />
              <AvatarFallback>
                {selectedContact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
