import React, { useState, useRef, useEffect } from "react";

import {
  IconMessageCircle,
  IconX,
  IconSend,
  IconRobot,
  IconLoader,
} from "./ChatIcons";
import { userChatBot } from "@/api/axios";

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "model",
      text: "Hello! How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue("");

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await userChatBot({
        message: userText,
      });
      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: res?.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[90vw] sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up border border-emerald-100 ring-1 ring-black/5">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <IconRobot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">
                  CHAT AI
                </h3>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                } animate-slide-in`}
              >
                <div
                  className={`
                    max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-tr-none"
                        : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start w-full animate-pulse">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full pl-4 pr-12 py-3 bg-slate-100 border-transparent focus:bg-white border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl outline-none transition-all text-sm placeholder:text-slate-400 text-slate-700"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className={`
                  absolute right-2 p-2 rounded-lg transition-all cursor-pointer
                  ${
                    !inputValue.trim() || isLoading
                      ? "text-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 text-white shadow-md hover:bg-emerald-700 hover:scale-105 active:scale-95"
                  }
                `}
              >
                {isLoading ? (
                  <IconLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <IconSend className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={`
          h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 cursor-pointer
          ${
            isOpen
              ? "bg-slate-700 hover:bg-slate-800 rotate-90"
              : "bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-1 hover:shadow-emerald-500/30"
          }
        `}
      >
        {isOpen ? (
          <IconX className="w-6 h-6 text-white" />
        ) : (
          <IconMessageCircle className="w-7 h-7 text-white" />
        )}
      </button>
    </div>
  );
};
