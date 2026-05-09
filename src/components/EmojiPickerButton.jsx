import { useState, useRef, useEffect } from "react";
import Picker from "emoji-picker-react";
import { Smile } from "lucide-react";

export default function EmojiPickerButton({
  textareaRef,
  setValue,
  name,
  getValues,
  wrapperClassName = "",
  buttonClassName = "",
  pickerClassName = "",
  pickerPlacement = "up",
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
    <div className={`relative inline-flex ${wrapperClassName}`}>
      <button
        type="button"
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className={`flex h-10 w-10 items-center justify-center text-emerald-600 transition hover:bg-emerald-50 ${buttonClassName}`}
        aria-label="Add emoji"
      >
        <Smile className="w-5 h-5" />
      </button>

      {showEmojiPicker && (
        <div
          ref={pickerRef}
          className={
            pickerPlacement === "down"
              ? `absolute left-0 top-full z-50 mt-2 origin-top-left scale-[0.65] sm:scale-75 max-w-[calc(100vw-1rem)] ${pickerClassName}`
              : `absolute bottom-full left-0 z-50 mb-2 origin-bottom-left scale-[0.65] sm:scale-75 max-w-[calc(100vw-1rem)] ${pickerClassName}`
          }
        >
          <Picker
            onEmojiClick={(emojiData) => handleEmojiSelect(emojiData.emoji)}
          />
        </div>
      )}
    </div>
  );
}
