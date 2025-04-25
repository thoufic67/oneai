"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export function BackgroundGradient() {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 -z-10 h-full w-full blur-3xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            theme === "dark"
              ? "from-primary-500/60 via-transparent to-cyan-500/60"
              : "from-primary-200/60 via-transparent to-cyan-200/60"
          }`}
        />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
      </motion.div>
    </div>
  );
}
