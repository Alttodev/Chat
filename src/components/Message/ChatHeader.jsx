import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Video, MoreVertical, Ban } from "lucide-react";
import dayjs from "dayjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatLastSeen = (value) => {
  if (!value) return "";

  const date = dayjs(value);
  if (!date.isValid()) return value;

  const now = dayjs();
  const time = date.format("h:mm A");

  if (date.isSame(now, "day")) {
    return `Today ${time}`;
  }

  if (date.isSame(now.subtract(1, "day"), "day")) {
    return `Yesterday ${time}`;
  }

  return date.format("MMM D, YYYY h:mm A");
};

export default function ChatHeader({
  contact,
  setShowChat,
  onToggleBlockUser,
  isTogglingBlock,
  isBlocked,
  onAudioCall,
  isCalling,
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setShowChat(false)}
        >
          <ArrowLeft className="w-5 h-5 text-emerald-600" />
        </Button>
        <div className="relative">
          <Avatar className="w-10 h-10 text-emerald-600">
            <AvatarImage
              src={contact.avatar || "/placeholder.svg"}
              alt={contact.name}
            />
            <AvatarFallback>
              {contact.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          {contact.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-600 border-2 border-background rounded-full" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-emerald-600">{contact.name}</h3>
          <p className="text-sm text-muted-foreground">
            {contact.isOnline ? "Online" : `Last seen ${formatLastSeen(contact.lastSeen)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onAudioCall} disabled={isCalling}>
          <Phone className="w-4 h-4 text-emerald-600" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="w-4 h-4 text-emerald-600" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
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
                {isBlocked ? "Unblock user" : "Block user"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
