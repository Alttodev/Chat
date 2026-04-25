import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Smile, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const pickerRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Determine placeholder based on block status
  const placeholder = blockedByMe
    ? "You blocked this user"
    : isBlocked
      ? "User blocked you"
      : "Type a message...";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isBlocked) return;
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji) => {
    const input = inputRef.current;
    if (!input) {
      setNewMessage((prev) => `${prev}${emoji}`);
      setShowEmojiPicker(false);
      return;
    }

    const start = input.selectionStart ?? newMessage.length;
    const end = input.selectionEnd ?? newMessage.length;
    const updated =
      newMessage.substring(0, start) + emoji + newMessage.substring(end);

    setNewMessage(updated);

    setTimeout(() => {
      input.focus();
      input.selectionStart = input.selectionEnd = start + emoji.length;
    }, 0);

    setShowEmojiPicker(false);
  };

  return (
    <div className="p-4 border-t bg-card">
      <div className="flex items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          type="button"
          disabled={isBlocked}
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="w-4 h-4 text-emerald-600" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
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
            className="pr-10 resize-none"
            disabled={isBlocked}
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            disabled={isBlocked}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <Smile className="w-4 h-4 text-emerald-600" />
          </Button>
          {showEmojiPicker && (
            <div
              ref={pickerRef}
              className="absolute bottom-11 right-0 z-50 scale-90 origin-bottom-right"
            >
              <Picker
                onEmojiClick={(emojiData) => handleEmojiSelect(emojiData.emoji)}
              />
            </div>
          )}
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={
            isBlocked || (!newMessage.trim() && !selectedFile) || isSending
          }
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
          {selectedFile ? selectedFile.name : "Press Enter to send"}
        </Badge>
      </div>
    </div>
  );
}
