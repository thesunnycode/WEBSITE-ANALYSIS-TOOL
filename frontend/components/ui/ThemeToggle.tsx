"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2 text-gray-400 hover:text-white rounded-lg transition-transform duration-200 hover:scale-105 will-change-transform"
    >
      {theme === "light" ? (
        <SunIcon className="h-5 w-5 text-orange" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </motion.button>
  );
}
