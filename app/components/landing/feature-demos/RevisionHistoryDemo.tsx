/**
 * @file RevisionHistoryDemo.tsx
 * @description Interactive demo for the Revision History feature. Now includes a timeline/stepper UI to switch between revisions, animated message content changes, and an edit button for live editing.
 */
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { History, Pencil, Save } from "lucide-react";
import { useState } from "react";

const revisions = [
  "Initial message content.",
  "Edited message content.",
  "Regenerated message content!",
];

export default function RevisionHistoryDemo() {
  const [step, setStep] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(revisions[0]);

  // Handle save edit
  const handleSave = () => {
    setEditing(false);
  };

  // When step changes, reset edit value
  const handleStep = (idx: number) => {
    setStep(idx);
    setEditValue(revisions[idx]);
    setEditing(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Timeline/stepper */}
      <div className="flex gap-2 mb-2">
        {revisions.map((_, idx) => (
          <button
            key={idx}
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 text-xs font-bold ${
              idx === step
                ? "border-primary bg-primary text-white scale-110"
                : "border-default-200 bg-white text-default-400 hover:scale-105"
            }`}
            onClick={() => handleStep(idx)}
            aria-label={`Go to revision ${idx + 1}`}
            type="button"
          >
            {idx + 1}
          </button>
        ))}
      </div>
      {/* Message bubble with animation */}
      <motion.div
        key={step + (editing ? "-edit" : "-view")}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 px-4 py-2 bg-default-100 rounded-full shadow border border-default-200 relative min-w-[180px]"
      >
        {editing ? (
          <input
            className="flex-1 bg-white border border-default-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
        ) : (
          <span className="text-xs text-default-700">{editValue}</span>
        )}
        <button
          className="ml-2 p-1 rounded-full hover:bg-default-200 transition"
          onClick={editing ? handleSave : () => setEditing(true)}
          aria-label={editing ? "Save" : "Edit"}
          type="button"
        >
          {editing ? (
            <Save className="w-4 h-4 text-primary" />
          ) : (
            <Pencil className="w-4 h-4 text-primary" />
          )}
        </button>
        <AnimatePresence>
          {!editing && (
            <motion.div
              key="history-badge"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-primary/90 text-white px-2 py-1 rounded-full text-xs shadow"
            >
              <History className="w-4 h-4 " />
              <span className="text-xs ">
                {step === 0
                  ? "Original"
                  : step === 1
                    ? "Edited"
                    : "Regenerated"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="mt-8 text-xs text-default-500">Browse & edit history</div>
    </div>
  );
}
