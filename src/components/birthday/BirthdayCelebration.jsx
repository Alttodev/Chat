import { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";

const CONFETTI_COLORS = ["#f472b6", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa"];

function generatePieces(count = 60) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2.5 + Math.random() * 1.5,
    size: 6 + Math.random() * 6,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotate: Math.random() * 360,
  }));
}

export function BirthdayCelebration({ open, onClose, autoCloseMs = 5000 }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!open) return;

    setPieces(generatePieces());

    const timer = setTimeout(() => {
      onClose?.();
    }, autoCloseMs);

    return () => clearTimeout(timer);
  }, [open, autoCloseMs, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      {/* Confetti layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="absolute top-[-10px] rounded-sm animate-confetti-fall"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.4,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              transform: `rotate(${p.rotate}deg)`,
            }}
          />
        ))}
      </div>

      {/* Message card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md rounded-2xl border border-gray-100 bg-white px-10 py-12 text-center shadow-2xl animate-pop-in"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <PartyPopper className="h-8 w-8 text-amber-500" />
        </div>

        <h2 className="text-2xl font-bold text-emerald-600">Happy Birthday!</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Wishing you a wonderful year ahead.
        </p>

        <button
          onClick={onClose}
          className="mt-7 w-full rounded-full cursor-pointer bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
        >
          Nice!
        </button>
      </div>
    </div>
  );
}
