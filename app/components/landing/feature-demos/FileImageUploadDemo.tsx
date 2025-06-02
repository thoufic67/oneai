/**
 * @file FileImageUploadDemo.tsx
 * @description Interactive demo for the File & Image Uploads feature. Shows a preview of the uploaded file (if image), supports drag-and-drop, click-to-upload, animated progress bar, and a thumbnail gallery.
 */
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, ImageIcon, X } from "lucide-react";
import { useState, useRef } from "react";

const demoImages = [
  "/android-chrome-192x192.png",
  "/logos/gemini.svg",
  "/logos/openai.svg",
  "/logos/anthropic.svg",
  "/logos/mistral.svg",
];

type UploadedThumb = {
  src: string;
  isObjectUrl: boolean; // true if from user upload, false if demo
};

export default function FileImageUploadDemo() {
  const [hovered, setHovered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedThumb[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on unmount or removal
  const cleanupObjectUrl = (url: string) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setUploading(true);
      setTimeout(() => {
        const objectUrl = URL.createObjectURL(file);
        setUploaded((prev) =>
          [{ src: objectUrl, isObjectUrl: true }, ...prev].slice(0, 3)
        );
        setUploading(false);
      }, 900);
    } else {
      // fallback to demo image if not an image file
      handleUpload();
    }
  };

  // Simulate upload (for drag-and-drop or fallback)
  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      const img = demoImages[Math.floor(Math.random() * demoImages.length)];
      setUploaded((prev) =>
        [{ src: img, isObjectUrl: false }, ...prev].slice(0, 3)
      );
      setUploading(false);
    }, 900);
  };

  // Drag-and-drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setHovered(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setUploading(true);
      setTimeout(() => {
        const objectUrl = URL.createObjectURL(file);
        setUploaded((prev) =>
          [{ src: objectUrl, isObjectUrl: true }, ...prev].slice(0, 3)
        );
        setUploading(false);
      }, 900);
    } else {
      handleUpload();
    }
  };

  // Remove thumbnail and clean up object URL if needed
  const removeThumb = (idx: number) => {
    setUploaded((prev) => {
      const toRemove = prev[idx];
      if (toRemove?.isObjectUrl) cleanupObjectUrl(toRemove.src);
      return prev.filter((_, i) => i !== idx);
    });
  };

  return (
    <div className="flex flex-col items-center w-full">
      <motion.div
        className={`w-24 h-24 flex items-center justify-center border-2 border-dashed rounded-lg bg-default-100 relative transition-colors duration-200 cursor-pointer ${
          hovered ? "border-primary bg-primary/10" : "border-default-300"
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setHovered(true);
        }}
        onDragLeave={() => setHovered(false)}
        tabIndex={0}
        aria-label="Upload file or image"
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          disabled={uploading}
          accept="image/*"
        />
        <motion.div
          animate={{ y: hovered ? 10 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <FileUp className="w-8 h-8 text-primary" />
        </motion.div>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-2 right-2"
          >
            <ImageIcon className="w-5 h-5 text-primary-400" />
          </motion.div>
        )}
        <AnimatePresence>
          {uploading && (
            <motion.div
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-lg"
            >
              <div className="w-12 h-2 bg-default-200 rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-2 bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </div>
              <span className="text-xs text-default-400 mt-2">Uploading…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="mt-2 text-xs text-default-500">
        Drag & drop or click to upload
      </div>
      {/* Thumbnail gallery */}
      <div className="flex gap-2 mt-2">
        {uploaded.map((thumb, i) => (
          <motion.div
            key={thumb.src + i}
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={thumb.src}
              alt="Uploaded preview"
              className="w-10 h-10 rounded shadow border border-default-200 bg-white object-cover"
            />
            <button
              className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow border border-default-200 hover:bg-default-100"
              onClick={() => removeThumb(i)}
              tabIndex={-1}
              aria-label="Remove image"
              type="button"
            >
              <X className="w-3 h-3 text-default-400" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
