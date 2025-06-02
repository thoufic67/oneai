/**
 * @file ShareableLinksDemo.tsx
 * @description Interactive demo for the Shareable Links feature. Now includes a copy button with animation, a public/private toggle with animated lock/unlock icon, and animated link changes.
 */
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Link as LinkIcon, Lock, Unlock } from "lucide-react";
import { useState } from "react";

export default function ShareableLinksDemo() {
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [link, setLink] = useState("aiflo.space/share/123");

  // Simulate toggling link privacy
  const handleToggle = () => {
    setIsPublic((pub) => !pub);
    setLink((prev) =>
      prev.endsWith("123")
        ? "aiflo.space/share/private-xyz"
        : "aiflo.space/share/123"
    );
  };

  // Simulate copy to clipboard
  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard?.writeText(link);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <motion.div
        className="flex items-center gap-2 px-4 py-2 bg-default-100 rounded-full shadow border border-default-200 relative"
        whileHover={{ backgroundColor: "#f1f5f9" }}
      >
        <button
          className="p-1 rounded-full hover:bg-default-200 transition"
          onClick={handleToggle}
          aria-label={isPublic ? "Make private" : "Make public"}
          type="button"
        >
          <motion.span
            initial={false}
            animate={{ rotate: isPublic ? 0 : -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {isPublic ? (
              <Unlock className="w-5 h-5 text-primary" />
            ) : (
              <Lock className="w-5 h-5 text-primary" />
            )}
          </motion.span>
        </button>
        <motion.span
          key={link}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
          className="text-xs text-default-700 font-mono"
        >
          {link}
        </motion.span>
        <button
          className="p-1 rounded-full hover:bg-default-200 transition"
          onClick={handleCopy}
          aria-label="Copy link"
          type="button"
        >
          <Share2 className="w-4 h-4 text-primary" />
        </button>
        <AnimatePresence>
          {copied && (
            <motion.div
              key="copied"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-primary/90 text-white px-2 py-1 rounded-full text-xs shadow"
            >
              <Share2 className="w-3 h-3 mr-1" />
              Copied!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="mt-2 text-xs text-default-500">
        {isPublic
          ? "Share conversations securely"
          : "Private link (not shareable)"}
      </div>
    </div>
  );
}
