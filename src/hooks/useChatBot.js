// hooks/useChatbot.js
import { chatbotApi } from "@/api/axios";
import { useState, useCallback } from "react";


const WELCOME_MESSAGE = {
  role: "assistant",
  text: "Hi! I'm Clix AI. How can I help you?",
};

export function useChatbot() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [sending, setSending] = useState(false);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || sending) return;

      const userMessage = { role: "user", text: text.trim() };
      const historyForRequest = messages.filter((m) => m !== WELCOME_MESSAGE);

      setMessages((prev) => [...prev, userMessage]);
      setSending(true);

      try {
        const res = await chatbotApi.sendMessage(
          text.trim(),
          historyForRequest,
        );
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: res.reply },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Something went wrong — please try again.",
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [messages, sending],
  );

  return { messages, sending, sendMessage };
}