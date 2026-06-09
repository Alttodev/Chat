import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, Ban, Phone } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatLastSeen = (value) => {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // AM/PM
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short", // May
    day: "numeric", // 1
    year: "numeric", // 2025
  });
};

export default function ChatHeader({
  contact,
  setShowChat,
  onToggleBlockUser,
  isTogglingBlock,
  blockedByMe,
  onAudioCall,

}) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setShowChat(false)}
        >
          <ArrowLeft className="w-5 h-5 text-emerald-600" />
        </Button>
        <div className="relative">
          <Avatar className="h-10 w-10 text-emerald-600">
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
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-foreground">
            {contact.name}
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            {contact.isOnline
              ? "Online"
              : `Last seen ${formatLastSeen(contact.lastSeen)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={onAudioCall}
          // disabled={isCalling}
        >
          <Phone className="w-4 h-4 text-emerald-600" />
        </Button>

        {/* <Button variant="ghost" size="icon">
          <Video className="w-4 h-4 text-emerald-600" />
        </Button> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <MoreVertical className="w-4 h-4 text-emerald-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={onToggleBlockUser}
              disabled={isTogglingBlock}
              className="cursor-pointer"
            >
              <Ban className="w-4 h-4 mr-2 text-red-500" />
              <span className="text-red-500">
                {blockedByMe ? "Unblock user" : "Block user"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
