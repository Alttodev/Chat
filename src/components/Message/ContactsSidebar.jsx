import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SkeletonComment } from "../skeleton/commentSkeleton";

export default function ContactsSidebar({
  contacts,
  selectedContact,
  setSelectedContact,
  setShowChat,
  showChat,
  loadMoreRef,
  isLoadingMore,
}) {
  return (
    <Card
      className={cn(
        "w-full border-border/70 bg-background/90 p-0 shadow-none backdrop-blur transition-all md:w-[22rem] md:rounded-none md:border-r lg:w-[23rem]",
        showChat ? "hidden md:block" : "block",
      )}
    >
      <div className="border-b border-border/70 bg-background/95 px-4 py-4 backdrop-blur">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Messages
        </h2>
        <p className="text-sm text-muted-foreground">Pick a chat to continue</p>
      </div>
      <ScrollArea
        className="h-[calc(100dvh-4rem)]"
        viewportClassName="p-2 pb-8"
      >
        <div className="space-y-1 p-1">
          {contacts.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No conversations
            </div>
          )}
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => {
                setSelectedContact(contact);
                setShowChat(true);
              }}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-2xl p-3 transition-all",
                selectedContact?.id === contact.id &&
                  "bg-emerald-500/10 text-foreground ring-1 ring-emerald-500/20",
                selectedContact?.id !== contact.id &&
                  "hover:bg-emerald-500/5 hover:text-foreground",
              )}
            >
              <div className="relative">
                <Avatar className="h-12 w-12 text-sm text-emerald-600">
                  <AvatarImage
                    className="h-full w-full cursor-pointer object-cover object-top"
                    src={contact?.profileImage || "/placeholder.svg"}
                  />
                  <AvatarFallback>
                    {contact.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-background ${
                    contact?.isOnline ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <p className="truncate font-medium">{contact.name}</p>
                  {contact.unreadCount > 0 && (
                    <Badge className="flex-shrink-0 bg-emerald-600 text-white">
                      {contact.unreadCount}
                    </Badge>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm line-clamp-1",
                    selectedContact?.id === contact.id
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {contact.lastMessageText
                    ? contact.lastMessageText
                    : contact.isOnline
                      ? "Online"
                      : `Last seen ${contact.lastSeen}`}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div ref={loadMoreRef} className="p-2">
          {isLoadingMore && <SkeletonComment />}
        </div>
      </ScrollArea>
    </Card>
  );
}
