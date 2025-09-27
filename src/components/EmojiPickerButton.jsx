import { useState, useRef, useEffect } from "react";
import Picker from "emoji-picker-react";
import { Smile } from "lucide-react";

export default function EmojiPickerButton({
  textareaRef,
  setValue,
  name,
  getValues,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = getValues(name) || "";

    const updated =
      currentText.substring(0, start) + emoji + currentText.substring(end);

    setValue(name, updated, { shouldDirty: true, shouldTouch: true });

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    }, 0);

    setShowEmojiPicker(false);
  };

  return (
    <div className="relative">
      <span
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className="absolute bottom-5 right-2 text-emerald-600 cursor-pointer"
      >
        <Smile className="w-6 h-6" />
      </span>

      {showEmojiPicker && (
        <div
          ref={pickerRef}
          className="absolute top-0 right-0 z-50 scale-75 origin-top-right"
        >
          <Picker
            onEmojiClick={(emojiData) => handleEmojiSelect(emojiData.emoji)}
          />
        </div>
      )}
    </div>
  );
}
