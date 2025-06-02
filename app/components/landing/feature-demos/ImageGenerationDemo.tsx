/**
 * @file ImageGenerationDemo.tsx
 * @description Interactive demo for the Image Generation feature. Now includes a clickable button, animated 'generating' state, random image generation, and a slider to tune image brightness.
 */
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { useState } from "react";

const demoImages = [
  "/android-chrome-192x192.png",
  "/logos/gemini.svg",
  "/logos/openai.svg",
  "/logos/anthropic.svg",
  "/logos/mistral.svg",
];

export default function ImageGenerationDemo() {
  const [showImage, setShowImage] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [brightness, setBrightness] = useState(100);

  // Simulate image generation
  const handleGenerate = () => {
    setGenerating(true);
    setShowImage(false);
    setTimeout(() => {
      setImgIdx(Math.floor(Math.random() * demoImages.length));
      setGenerating(false);
      setShowImage(true);
    }, 900);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <motion.button
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold shadow hover:bg-primary-700 transition relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleGenerate}
        disabled={generating}
        type="button"
      >
        <Sparkles className="w-4 h-4" />
        {generating
          ? "Generating..."
          : showImage
            ? "Regenerate"
            : "Generate Image"}
        {generating && (
          <motion.span
            className="absolute right-2 animate-spin"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <RefreshCw className="w-4 h-4 ml-2 text-white/80" />
          </motion.span>
        )}
      </motion.button>
      {/* Brightness slider */}
      <div className="flex items-center gap-2 mt-2 w-full max-w-xs">
        <span className="text-xs text-default-400">Dim</span>
        <input
          type="range"
          min={60}
          max={140}
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          className="flex-1 accent-primary"
          disabled={!showImage}
        />
        <span className="text-xs text-default-400">Bright</span>
      </div>
      <div className="h-20 mt-2 flex items-center justify-center w-full">
        <AnimatePresence>
          {showImage && !generating && (
            <motion.div
              key={imgIdx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <img
                src={demoImages[imgIdx]}
                alt="Generated demo"
                className="w-16 h-16 rounded shadow border border-default-200"
                style={{ filter: `brightness(${brightness}%)` }}
              />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-pulse" />
            </motion.div>
          )}
          {generating && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center w-16 h-16"
            >
              <Sparkles className="w-8 h-8 text-primary animate-bounce" />
              <span className="text-xs text-default-400 mt-1">
                Generating...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
