/**
 * @file UnlimitedMessagingDemo.tsx
 * @description Interactive demo for the Unlimited Messaging feature. Now includes a fake chat input, animated sending state, checkmark, and a scrollable chat area for multiple messages.
 */
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Check, Loader2 } from "lucide-react";
import { useState, useRef } from "react";

export default function UnlimitedMessagingDemo() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { text: "Hello, world!", sent: true },
  ]);
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Handle sending a message
  const sendMessage = () => {
    if (!input.trim()) return;
    setSending(true);
    setMessages((msgs) => [...msgs, { text: input, sent: false }]);
    setInput("");
    setTimeout(() => {
      setMessages((msgs) =>
        msgs.map((msg, i) =>
          i === msgs.length - 1 ? { ...msg, sent: true } : msg
        )
      );
      setSending(false);
      // Scroll to bottom
      setTimeout(() => {
        chatRef.current?.scrollTo({
          top: chatRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }, 900);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Chat area */}
      <div
        ref={chatRef}
        className="w-full max-w-xs h-24 bg-default-100 rounded-lg p-3 flex flex-col gap-2 border border-default-200 shadow overflow-y-auto"
      >
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 justify-end"
          >
            <span className="px-3 py-1 rounded-2xl text-xs shadow bg-primary text-white">
              {msg.text}
            </span>
            <AnimatePresence>
              {msg.sent ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check className="w-4 h-4 text-primary-500" />
                </motion.span>
              ) : (
                <motion.span
                  key="sending"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Loader2 className="w-4 h-4 text-primary-300 animate-spin" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
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
          className="flex-1 px-3 py-1 rounded-lg border border-default-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <motion.button
          type="submit"
          className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-semibold shadow hover:bg-primary-700 transition disabled:opacity-50"
          whileTap={{ scale: 0.95 }}
          disabled={!input.trim() || sending}
        >
          <MessageSquare className="w-4 h-4" />
        </motion.button>
      </form>
      <div className="mt-2 text-xs text-default-500">
        Unlimited, real-time chat
      </div>
    </div>
  );
}
