"use client";

// Path: /components/dashboard/Sidebar.tsx
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  History,
  Activity,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type MenuItem = {
  title: string;
  icon: React.ReactNode;
  href: string;
};

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/dashboard",
  },
  {
    title: "New Analysis",
    icon: <Search className="h-5 w-5" />,
    href: "/analysis/new",
  },
  {
    title: "History",
    icon: <History className="h-5 w-5" />,
    href: "/analysis/history",
  },
  {
    title: "Uptime",
    icon: <Activity className="h-5 w-5" />,
    href: "/dashboard/uptime",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex h-full flex-col bg-dark-card/20 backdrop-blur-sm border-r border-white/5">
      {/* Logo and Title */}
      <div className="px-6 py-6 border-b border-white/5">
        <h2 className="text-lg font-semibold text-white">Website Analysis</h2>
        <p className="text-sm text-gray-400">Monitoring Tool</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
              ${
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.title}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-400 rounded-lg transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
