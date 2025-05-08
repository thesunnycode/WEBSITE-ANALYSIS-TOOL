"use client";

import { motion } from "framer-motion";

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({
  message = "Loading analysis results...",
}: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {/* Spinner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-orange/20 rounded-full" />

        {/* Spinning inner ring */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin" />
      </motion.div>

      {/* Loading text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-gray-300 font-medium text-lg"
      >
        {message}
      </motion.p>

      {/* Pulsing dots */}
      <div className="flex gap-1 mt-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-2 h-2 bg-orange rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
