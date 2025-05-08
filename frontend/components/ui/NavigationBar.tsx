"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const NavigationBar = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav
      className="fixed top-0 right-0 left-64 z-40 flex items-center justify-between p-4 bg-dark/50 backdrop-blur-sm border-b border-white/5"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-white">
          {pathname === '/dashboard' && 'Dashboard'}
          {pathname === '/analysis/new' && 'New Analysis'}
          {pathname === '/analysis/history' && 'Analysis History'}
          {pathname === '/monitoring' && 'Uptime Monitor'}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">{user.email}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
