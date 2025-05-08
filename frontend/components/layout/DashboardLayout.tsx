"use client";

// import { memo } from "react";
// import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
// import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// interface User { ... }

function DashboardLayout({ children }: DashboardLayoutProps) {
  // const [mounted, setMounted] = useState(false);
  // useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex min-h-screen" suppressHydrationWarning>
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 z-50">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen p-6 rounded-lg shadow-md">
        {/* Page Content */}
        <div className="max-w-[1920px] mx-auto relative z-0">{children}</div>
      </main>
    </div>
  );
}

export default DashboardLayout;
