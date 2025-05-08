"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function ErrorResults({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] p-6"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-400 mb-6">Failed to load analysis results</p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500
                   hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
      >
        Try again
      </button>
    </motion.div>
  );
}
