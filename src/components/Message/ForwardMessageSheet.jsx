import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getMessageMediaMimeType,
  getMessageMediaUrl,
  isAudioMediaUrl,
  isVideoMediaUrl,
} from "@/lib/media";
import { Search, Send } from "lucide-react";

const getMessagePreview = (message) => {
  if (!message) return "";

  const text = message?.text?.trim();
  const mediaUrl = getMessageMediaUrl(message);
  const mediaType = getMessageMediaMimeType(message);
  const hasMedia = !!mediaUrl;
  const isAudio = isAudioMediaUrl(mediaUrl, mediaType);
  const isVideo = isVideoMediaUrl(mediaUrl, mediaType);

  if (text && hasMedia) {
    return `${text.slice(0, 90)}${text.length > 90 ? "..." : ""}`;
  }

  if (text) {
    return `${text.slice(0, 140)}${text.length > 140 ? "..." : ""}`;
  }

  if (hasMedia) {
    if (isAudio) return "Audio message";
    return isVideo ? "Video message" : "Photo message";
  }

  return "Message";
};

export default function ForwardMessageSheet({
  open,
  onOpenChange,
  message,
  contacts = [],
  onSelectContact,
  isSending,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return contacts;

    return contacts.filter((contact) => {
      const name = contact?.name || "";
      const status = contact?.lastMessageText || "";
      return (
        name.toLowerCase().includes(term) || status.toLowerCase().includes(term)
      );
    });
  }, [contacts, searchTerm]);

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setSearchTerm("");
        onOpenChange(nextOpen);
      }}
    >
      <SheetContent className="flex w-full max-w-lg flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle className="text-base font-semibold">
            Forward message
          </SheetTitle>
          <SheetDescription className="text-sm">
            Choose a chat to send this message to.
          </SheetDescription>
        </SheetHeader>

        <div className="border-b px-5 py-4">
          <div className="rounded-2xl border bg-muted/40 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Forwarded
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {getMessagePreview(message)}
            </p>
          </div>
        </div>

        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search chats"
              className="h-11 rounded-full pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-3 py-4">
            {filteredContacts.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
                No matching chats found.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <Button
                    key={contact.id}
                    type="button"
                    variant="ghost"
                    className="flex h-auto w-full items-center justify-between rounded-2xl border border-transparent px-3 py-3 text-left hover:border-emerald-500/20 hover:bg-emerald-500/5"
                    disabled={isSending}
                    onClick={() => onSelectContact?.(contact)}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative shrink-0">
                        <Avatar className="h-11 w-11">
                          <AvatarImage
                            className="h-full w-full cursor-pointer object-cover object-top"
                            src={contact?.profileImage || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {(contact?.name || "U")
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                            contact?.isOnline
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {contact?.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {contact?.lastMessageText || "Tap to forward"}
                        </p>
                      </div>
                    </div>

                    <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                      <Send className="h-3 w-3" />
                      Send
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
