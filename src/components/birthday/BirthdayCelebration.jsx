import { useEffect, useState } from "react";

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

function BirthdayRibbon() {
  return (
    <svg
      viewBox="0 0 220 44"
      className="mx-auto mb-1 h-11 w-full max-w-[220px] animate-ribbon-in"
      aria-hidden="true"
    >
      {/* left fold */}
      <path d="M14 8 L34 8 L34 36 L14 36 L24 22 Z" fill="#993556" />
      {/* right fold */}
      <path d="M206 8 L186 8 L186 36 L206 36 L196 22 Z" fill="#993556" />
      {/* main banner */}
      <rect x="20" y="4" width="180" height="28" rx="4" fill="#D4537E" />
      <text
        x="110"
        y="23"
        textAnchor="middle"
        fontSize="13"
        fontWeight="500"
        fill="#FBEAF0"
        fontFamily="var(--font-sans, sans-serif)"
      >
        Happy Birthday
      </text>
    </svg>
  );
}

function AnimatedCake() {
  return (
    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center">
      <svg
        viewBox="0 0 80 80"
        className="h-20 w-20 animate-cake-bounce"
        aria-hidden="true"
      >
        {/* flame */}
        <g
          className="animate-flame-flicker"
          style={{ transformOrigin: "40px 18px" }}
        >
          <path
            d="M40 8c3 4 4.5 7 4.5 9.5a4.5 4.5 0 1 1-9 0C35.5 15 37 12 40 8z"
            fill="#fbbf24"
          />
        </g>
        {/* candle */}
        <rect x="37.5" y="20" width="5" height="12" rx="1" fill="#f472b6" />
        {/* cake top layer */}
        <rect x="18" y="34" width="44" height="16" rx="3" fill="#fde68a" />
        <rect x="18" y="34" width="44" height="5" rx="2.5" fill="#fca5a5" />
        {/* cake base layer */}
        <rect x="12" y="50" width="56" height="20" rx="3" fill="#fcd34d" />
        <rect x="12" y="50" width="56" height="5" rx="2.5" fill="#f9a8d4" />
        {/* sprinkles */}
        <circle cx="26" cy="60" r="1.6" fill="#34d399" />
        <circle cx="40" cy="58" r="1.6" fill="#60a5fa" />
        <circle cx="54" cy="61" r="1.6" fill="#a78bfa" />
        <circle cx="33" cy="63" r="1.6" fill="#f472b6" />
        <circle cx="48" cy="64" r="1.6" fill="#fbbf24" />
      </svg>
    </div>
  );
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
        <BirthdayRibbon />
        <AnimatedCake />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Wishing you a wonderful year ahead.
        </p>

        <p className="mt-6 text-sm font-medium text-emerald-700">
          Create a birthday post and share with friends
        </p>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-full cursor-pointer bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
        >
          Nice!
        </button>
      </div>
    </div>
  );
}
