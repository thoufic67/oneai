/**
 * @file MultiModelChatDemo.tsx
 * @description Interactive demo for the Multi-Model Chat feature. Now includes clickable model icons, a fake chat input, animated message bubbles, a typing indicator, and a scrollable chat preview area.
 */
"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";

const models = [
  { name: "Gemini", logo: "/logos/gemini.svg" },
  { name: "GPT-4", logo: "/logos/openai.svg" },
  { name: "Claude", logo: "/logos/anthropic.svg" },
  { name: "Mistral", logo: "/logos/mistral.svg" },
];

export default function MultiModelChatDemo() {
  const [modelIndex, setModelIndex] = useState(0);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { text: "Hi! How can I help you today?", from: "ai" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  // Handle sending a message
  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { text: input, from: "user" }]);
    setInput("");
    setIsTyping(true);
    // Simulate AI response
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        {
          text: `(${models[modelIndex].name}): Here's a demo reply!`,
          from: "ai",
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-2">
      {/* Model selector */}
      <div className="flex gap-2 mb-2">
        {models.map((model, i) => (
          <motion.button
            key={model.name}
            className={`rounded-full border-2 flex items-center justify-center w-8 h-8 bg-white shadow transition-all duration-200 ${
              i === modelIndex
                ? "border-primary scale-110"
                : "border-default-200 opacity-70 hover:scale-105"
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModelIndex(i)}
            aria-label={`Switch to ${model.name}`}
            type="button"
          >
            <Image src={model.logo} alt={model.name} width={20} height={20} />
          </motion.button>
        ))}
      </div>
      {/* Chat area with scroll */}
      <div
        ref={chatRef}
        className="w-full max-w-xs  max-h-28 bg-default-100 rounded-lg p-3 flex flex-col gap-2 border border-default-200 shadow relative overflow-y-auto"
      >
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`flex items-end gap-2 ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.from === "ai" && (
              <Image
                src={models[modelIndex].logo}
                alt={models[modelIndex].name}
                width={18}
                height={18}
                className="rounded-full border border-default-200"
              />
            )}
            <span
              className={`px-3 py-1 rounded-2xl text-xs shadow ${
                msg.from === "ai"
                  ? "bg-white text-default-700 border border-default-200"
                  : "bg-primary text-white"
              }`}
            >
              {msg.text}
            </span>
            {msg.from === "user" && (
              <Sparkles className="w-4 h-4 text-primary-400" />
            )}
          </motion.div>
        ))}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 mt-1"
            >
              <Image
                src={models[modelIndex].logo}
                alt={models[modelIndex].name}
                width={18}
                height={18}
                className="rounded-full border border-default-200"
              />
              <span className="bg-default-200 px-2 py-1 rounded-2xl text-xs text-default-500 animate-pulse">
                typing…
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Fake chat input */}
      <form
        className="flex gap-2 mt-2 w-full max-w-xs"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          ref={inputRef}
          className="flex-1 px-3 py-1 rounded-lg border border-default-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
          placeholder={`Message (${models[modelIndex].name})…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
        />
        <motion.button
          type="submit"
          className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-semibold shadow hover:bg-primary-700 transition disabled:opacity-50"
          whileTap={{ scale: 0.95 }}
          disabled={!input.trim() || isTyping}
        >
          Send
        </motion.button>
      </form>
    </div>
  );
}
