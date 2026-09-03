import { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { useChatbot } from "@/hooks/useChatBot";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, sending, sendMessage } = useChatbot();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, sending]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <>
      {/* Floating launcher button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Clix AI"
          className="group fixed bottom-14 right-1 sm:right-0 z-50 flex h-10 w-10 cursor-pointer items-center justify-center sm:h-12 sm:w-12"
        >
          {/* Soft green glow */}
          <span className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md transition-opacity duration-300 group-hover:bg-emerald-500/30" />

          {/* Green AI ring */}
          <span className="absolute inset-0 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,#047857,#059669,#10b981,#34d399,#10b981,#059669,#047857)] p-[2px]">
            <span className="block h-full w-full rounded-full bg-white" />
          </span>

          {/* Inner circle */}
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:scale-110 sm:h-7 sm:w-7">
            {/* Clix AI icon */}
            <span className="text-[16px] font-bold text-emerald-600 sm:text-[18px]">
              ✦
            </span>
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[350px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border/60 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-emerald-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emerald-500/20 blur-[3px]" />

                <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#047857,#059669,#10b981,#34d399,#10b981,#059669,#047857)] p-[1.5px]">
                  <span className="block h-full w-full rounded-full bg-white" />
                </span>

                <span className="relative text-[15px] font-bold text-emerald-600">
                  ✦
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                Clix AI
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-black/5 cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="relative mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-emerald-500/20 blur-[2px]" />

                    <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#047857,#059669,#10b981,#34d399,#10b981,#059669,#047857)] p-[1.5px]">
                      <span className="block h-full w-full rounded-full bg-white" />
                    </span>

                    <span className="relative text-[13px] font-bold text-emerald-600">
                      ✦
                    </span>
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-emerald-600 text-white"
                      : "rounded-bl-sm bg-muted text-foreground"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="relative mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-emerald-500/20 blur-[2px]" />

                  <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#047857,#059669,#10b981,#34d399,#10b981,#059669,#047857)] p-[1.5px]">
                    <span className="block h-full w-full rounded-full bg-white" />
                  </span>

                  <span className="relative text-[13px] font-bold text-emerald-600">
                    ✦
                  </span>
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border/60 p-3"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask Clix AI..."
              className="h-10 flex-1 rounded-full border border-border/60 bg-muted px-4 text-sm focus:border-emerald-400 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
