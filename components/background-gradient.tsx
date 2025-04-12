"use client";

import { motion } from "framer-motion";

export function BackgroundGradient() {
  return (
    <>
      {/* Fixed Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-purple-50 -z-10" />

      {/* Animated Background Gradients - Fixed */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="relative w-full h-full overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary-400/10 rounded-full mix-blend-multiply filter blur-[80px] "
          />
          <motion.div
            initial={{ opacity: 0 }}
            transition={{ duration: 2, delay: 0.4 }}
            className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-[80px]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.8 }}
            className="absolute -bottom-1/4 left-1/4 w-1/2 h-1/2 bg-yellow-400/10 rounded-full mix-blend-multiply filter blur-[80px] "
          />
        </div>
      </div>
    </>
  );
}
