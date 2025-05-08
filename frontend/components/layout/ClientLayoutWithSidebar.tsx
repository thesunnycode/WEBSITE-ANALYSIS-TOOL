"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import { usePathname } from "next/navigation";
import React from "react";
import { AnimatedGradientBackground } from "@/components/ui/AnimatedGradientBackground";

export default function ClientLayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isDashboard = pathname === "/dashboard";

  if (isAuthPage || isHomePage) {
    return <div className="flex-1">{children}</div>;
  }

  return (
    <AnimatedGradientBackground>
      <div className="flex min-h-screen">
        <div className="fixed inset-y-0 left-0 w-64 z-50">
          <Sidebar />
        </div>
        <div className={isDashboard ? "flex-1" : "flex-1 ml-64"}>
          <div className={isDashboard ? "p-6" : "p-6 max-w-[1920px] mx-auto"}>{children}</div>
        </div>
      </div>
    </AnimatedGradientBackground>
  );
} 