// @file Error boundary page for displaying a beautiful, animated error screen with retry functionality.
"use client";

import { useEffect } from "react";
import { Button } from "@heroui/button";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BackgroundGradient } from "@/app/components/background-gradient";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    /* eslint-disable no-console */
    console.error(error);
  }, [error]);

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Animated background gradient for visual appeal */}
      <BackgroundGradient />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 w-full max-w-md mx-auto p-8 rounded-2xl shadow-xl bg-white/80 dark:bg-black/80 backdrop-blur-lg flex flex-col items-center gap-6 border border-gray-200 dark:border-gray-800"
      >
        <AlertCircle className="w-16 h-16 text-red-500 animate-pulse" />
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Something went wrong
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 max-w-xs">
          {error.message ||
            "An unexpected error occurred. Please try again or contact support if the issue persists."}
        </p>
        <Button
          color="primary"
          size="lg"
          radius="lg"
          className="mt-2"
          onPress={reset}
        >
          Try again
        </Button>
      </motion.div>
    </div>
  );
}
