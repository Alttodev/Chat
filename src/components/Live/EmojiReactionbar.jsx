// components/Live/EmojiReactionBar.jsx
const EMOJIS = ["❤️", "😂", "🔥", "👏", "😮"];

export default function EmojiReactionBar({ onSend }) {
  return (
    <div className="absolute bottom-6 right-4 flex flex-col items-center gap-2">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSend(emoji)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-xl backdrop-blur transition hover:scale-110 hover:bg-white/30 active:scale-95"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}