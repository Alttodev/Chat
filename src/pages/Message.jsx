import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockContacts = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "/professional-woman.png",
    isOnline: true,
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    avatar: "/man-asian-professional.jpg",
    isOnline: false,
    lastSeen: "2 hours ago",
  },
  {
    id: "3",
    name: "Elena Vasquez",
    avatar: "/woman-latina-professional.jpg",
    isOnline: true,
  },
  {
    id: "4",
    name: "David Kim",
    avatar: "/man-korean-professional.jpg",
    isOnline: false,
    lastSeen: "1 day ago",
  },
];

const mockMessages = [
  {
    id: "1",
    text: "Hey! How's your day going?",
    sender: "friend",
    timestamp: new Date(Date.now() - 3600000),
    status: "read",
    senderName: "Sarah Chen",
    senderAvatar: "/professional-woman.png",
  },
  {
    id: "2",
    text: "Pretty good! Just finished that project we discussed. Want to grab coffee later?",
    sender: "user",
    timestamp: new Date(Date.now() - 3300000),
    status: "read",
    senderName: "You",
    senderAvatar: "/professional-headshot.png",
  },
  {
    id: "3",
    text: "That sounds perfect! How about 3 PM at the usual place?",
    sender: "friend",
    timestamp: new Date(Date.now() - 3000000),
    status: "read",
    senderName: "Sarah Chen",
    senderAvatar: "/professional-woman.png",
  },
  {
    id: "4",
    text: "Sounds great! See you there 😊",
    sender: "user",
    timestamp: new Date(Date.now() - 2700000),
    status: "delivered",
    senderName: "You",
    senderAvatar: "/professional-headshot.png",
  },
];

export default function Message() {
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState(mockContacts[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false); // mobile toggle
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: "user",
        timestamp: new Date(),
        status: "sent",
        senderName: "You",
        senderAvatar: "/professional-headshot.png",
      };
      setMessages([...messages, message]);
      setNewMessage("");

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const response = {
          id: (Date.now() + 1).toString(),
          text: "Thanks for the message! I'll get back to you soon.",
          sender: "friend",
          timestamp: new Date(),
          status: "sent",
          senderName: selectedContact.name,
          senderAvatar: selectedContact.avatar,
        };
        setMessages((prev) => [...prev, response]);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
        return <CheckCheck className="w-3 h-3 text-emerald-600" />; // emerald color
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
        {/* Contacts Sidebar */}
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
              {mockContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => {
                    setSelectedContact(contact);
                    setShowChat(true);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ",
                    selectedContact.id === contact.id &&
                      "bg-emerald-600 text-white"
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

        {/* Chat Area */}
        <Card
          className={cn(
            "flex-1 flex flex-col p-0 overflow-hidden",
            showChat ? "block" : "hidden md:flex"
          )}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center gap-3">
              {/* Back button for mobile */}
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
                {selectedContact.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-600 border-2 border-background rounded-full" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-emerald-600">
                  {selectedContact.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedContact.isOnline
                    ? "Online"
                    : `Last seen ${selectedContact.lastSeen}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="w-4 h-4 text-emerald-600" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="w-4 h-4 text-emerald-600" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4 text-emerald-600" />
              </Button>
            </div>
          </div>

          {/* Messages */}
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
                      <div
                        className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
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

          {/* Message Input */}
          <div className="p-4 border-t bg-card">
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Paperclip className="w-4 h-4 text-emerald-600" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="pr-10 resize-none"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  <Smile className="w-4 h-4 text-emerald-600" />
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                {newMessage.length}/1000
              </span>
              <Badge variant="secondary" className="text-xs text-emerald-600">
                Press Enter to send
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
