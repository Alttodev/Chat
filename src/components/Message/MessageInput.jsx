import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, X, ImagePlus } from "lucide-react";
import { useRef } from "react";
import Picker from "emoji-picker-react";

export default function MessageInput({
  newMessage,
  setNewMessage,
  handleSendMessage,
  selectedFile,
  onFileChange,
  isSending,
  isBlocked,
  blockedByMe,
}) {
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  // Determine placeholder based on block status
  const placeholder = blockedByMe
    ? "You blocked this user"
    : isBlocked
      ? "User blocked you"
      : "Type a message...";

  const handleRemoveFile = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isBlocked) return;
      handleSendMessage();
    }
  };

  return (
   <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t bg-card md:static md:z-auto md:w-full">
  <div className="flex items-end gap-2">
    <Button
      variant="ghost"
      size="icon"
      className="flex-shrink-0 cursor-pointer"
      type="button"
      disabled={isBlocked}
      onClick={() => fileInputRef.current?.click()}
    >
      <ImagePlus className="w-4 h-4 text-emerald-600" />
    </Button>

    <input
      ref={fileInputRef}
      type="file"
      accept="image/*,video/mp4"
      className="hidden"
      onChange={(e) => onFileChange(e.target.files?.[0] || null)}
    />

    <div className="flex-1 relative">
      <Input
        ref={inputRef}
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="pr-10 resize-none rounded-full px-4 text-base"
        disabled={isBlocked}
      />
    </div>

    <Button
      onClick={handleSendMessage}
      disabled={isBlocked || (!newMessage.trim() && !selectedFile) || isSending}
      className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
    >
      <Send className="w-4 h-4" />
    </Button>
  </div>

  <div className="flex justify-between items-center mt-2">
    <span className="text-xs text-muted-foreground">
      {newMessage.length}/1000
    </span>

    <Badge
      variant="secondary"
      className="text-xs text-emerald-600 flex items-center gap-1"
    >
      {selectedFile ? (
        <>
          <span className="max-w-[120px] truncate">{selectedFile.name}</span>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="hover:text-red-500"
          >
            <X className="w-3 h-3" />
          </button>
        </>
      ) : (
        "Press Enter to send"
      )}
    </Badge>
  </div>
</div>
  );
}
