import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ContactsSidebar from "@/components/Message/ContactsSidebar";
import MessagesList from "@/components/Message/MessagesList";
import MessageInput from "@/components/Message/MessageInput";
import ChatHeader from "@/components/Message/ChatHeader";

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
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send new message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

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
  };

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      <div className="flex flex-1 gap-2 overflow-hidden">
        {/* Sidebar */}
        <ContactsSidebar
          contacts={mockContacts}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          setShowChat={setShowChat}
          showChat={showChat}
        />

        {/* Chat Area */}
        <Card
          className={cn(
            "flex-1 flex flex-col p-0 overflow-hidden",
            showChat ? "block" : "hidden md:flex"
          )}
        >
          {/* Header */}
          <ChatHeader contact={selectedContact} setShowChat={setShowChat} />

          {/* Messages */}
          <MessagesList
            messages={messages}
            isTyping={isTyping}
            selectedContact={selectedContact}
            messagesEndRef={messagesEndRef}
          />

          {/* Input */}
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
          />
        </Card>
      </div>
    </div>
  );
}
