import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Smile, Send } from "lucide-react";

export default function MessageInput({
  newMessage,
  setNewMessage,
  handleSendMessage,
}) {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t bg-card">
      <div className="flex items-end gap-2">
        <Button variant="ghost" size="icon" className="flex-shrink-0">
          <Paperclip className="w-4 h-4 text-emerald-600" />
        </Button>
        <div className="flex-1 relative">
          <Input
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
  );
}
