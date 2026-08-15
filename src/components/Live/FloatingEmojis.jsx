// components/Live/FloatingEmojis.jsx
import { useEffect } from "react";

export default function FloatingEmojis({ reactions, onExpire }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes float-up {
          0%   { transform: translateY(0) scale(0.7); opacity: 0; }
          15%  { opacity: 1; transform: translateY(-16px) scale(1.15); }
          100% { transform: translateY(-260px) scale(1); opacity: 0; }
        }
      `}</style>
      {reactions.map((r) => (
        <FloatingEmoji key={r.id} reaction={r} onExpire={onExpire} />
      ))}
    </div>
  );
}

function FloatingEmoji({ reaction, onExpire }) {
  useEffect(() => {
    const timeout = setTimeout(() => onExpire(reaction.id), 2200);
    return () => clearTimeout(timeout);
  }, [reaction.id, onExpire]);

  return (
    <span
      className="absolute bottom-20 select-none text-3xl"
      style={{
        left: `${reaction.left}%`,
        animation: "float-up 2.2s ease-out forwards",
      }}
    >
      {reaction.emoji}
    </span>
  );
}