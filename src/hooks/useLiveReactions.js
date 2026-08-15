import { useState, useCallback } from "react";
import { useDataChannel } from "@livekit/components-react";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
let idCounter = 0;

export function useLiveReactions() {
  const [reactions, setReactions] = useState([]);

  const addReaction = useCallback((emoji) => {
    const id = `${Date.now()}-${idCounter++}`;
    const left = 15 + Math.random() * 70; // random horizontal position, %
    setReactions((prev) => [...prev, { id, emoji, left }]);
  }, []);

  const removeReaction = useCallback((id) => {
    setReactions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const { send } = useDataChannel("reactions", (msg) => {
    try {
      const { emoji } = JSON.parse(decoder.decode(msg.payload));
      addReaction(emoji);
    } catch {
      // ignore malformed payloads
    }
  });

  const sendReaction = useCallback(
    (emoji) => {
      addReaction(emoji); // show it immediately for the sender too
      send(encoder.encode(JSON.stringify({ emoji })), { reliable: false });
    },
    [send, addReaction]
  );

  return { reactions, sendReaction, removeReaction };
}