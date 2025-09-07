import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function ContactsSidebar({
  contacts,
  selectedContact,
  setSelectedContact,
  setShowChat,
  showChat,
}) {
  return (
    <Card
      className={cn(
        "w-full md:w-80 p-0 overflow-hidden border-r transition-all",
        showChat ? "hidden md:block" : "block"
      )}
    >
      <div className="p-4 border-b bg-card">
        <h2 className="text-lg font-semibold text-emerald-600">Messages</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="p-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => {
                setSelectedContact(contact);
                setShowChat(true);
              }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                selectedContact.id === contact.id && "bg-emerald-600 text-white"
              )}
            >
              <div className="relative">
                <Avatar className="text-sm text-emerald-600 w-12 h-12">
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
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-600 border-2 border-background rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{contact.name}</p>
                <p
                  className={cn(
                    "text-sm truncate",
                    selectedContact.id === contact.id
                      ? "text-white"
                      : "text-muted-foreground"
                  )}
                >
                  {contact.isOnline
                    ? "Online"
                    : `Last seen ${contact.lastSeen}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
