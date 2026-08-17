// components/Live/CommentsPanel.jsx
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

export default function CommentsPanel({ comments, onSend, posting }) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.trim() || posting) return;
    onSend(draft);
    setDraft("");
  };

  const visible = comments.slice(-30);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
      {/* Gradient fade so video stays visible behind the text */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      <div className="pointer-events-auto relative flex flex-col gap-2 px-4 pb-3">
        <div
          ref={scrollRef}
          className="max-h-48 space-y-1.5 overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {visible.map((c) => (
            <div
              key={c._id}
              className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300"
            >
              {c.avatarUrl ? (
                <img
                  src={c.avatarUrl}
                  alt=""
                  className="mt-0.5 h-6 w-6 flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="mt-0.5 h-6 w-6 flex-shrink-0 rounded-full bg-white/30" />
              )}
              <p className="text-sm leading-snug text-white drop-shadow">
                <span className="font-semibold">{c.username}</span>{" "}
                <span className="text-white/90">{c.text}</span>
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment…"
            maxLength={200}
            className="h-10 flex-1 rounded-full border border-white/30 bg-white/10 px-4 text-sm text-white placeholder:text-white/60 backdrop-blur focus:border-white/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || posting}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/90 text-black transition disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}