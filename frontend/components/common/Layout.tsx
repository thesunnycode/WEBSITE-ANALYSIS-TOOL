"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavigationBar from "./NavigationBar";
import SidebarMenu from "./SidebarMenu";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-dark">
      <NavigationBar />
      <SidebarMenu
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <AnimatePresence mode="wait">
        {isMounted && (
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`transition-all duration-300 ${
              isSidebarCollapsed ? "ml-16" : "ml-64"
            } pt-16`}
          >
            <div className="container mx-auto px-4 py-8">{children}</div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
