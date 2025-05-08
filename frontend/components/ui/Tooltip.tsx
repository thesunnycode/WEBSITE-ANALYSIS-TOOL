"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap"
            style={{
              top: "calc(100% + 5px)",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <div
              className="absolute w-2 h-2 bg-gray-900 rotate-45"
              style={{
                top: "-4px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
