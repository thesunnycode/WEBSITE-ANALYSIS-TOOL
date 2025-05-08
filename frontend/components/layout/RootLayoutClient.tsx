"use client";

import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/dashboard/Sidebar";
import { usePathname } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import NavigationBar from "@/components/ui/NavigationBar";

const inter = Inter({
  subsets: ["latin"],
});

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <body
      className={`${inter.className} bg-[#0f172a]`}
      suppressHydrationWarning
    >
      <AuthProvider>
        <NavigationBar />
        <div className="flex h-screen overflow-hidden">
          {/* Only show Sidebar if not on auth pages */}
          {!isAuthPage ? (
            <Sidebar />
          ) : (
            <LoadingSpinner size="lg" className="text-orange" />
          )}

          {/* Main Content Area - adjust padding based on page type */}
          <div
            className={`flex-1 overflow-auto ${!isAuthPage ? "pl-72" : "pl-0"}`}
          >
            <div className="min-h-screen p-8">{children}</div>
          </div>
        </div>
      </AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "",
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </body>
  );
}
