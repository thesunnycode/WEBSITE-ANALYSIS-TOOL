"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import FullPageSpinner from "@/components/loading/FullPageSpinner";
import { Card, CardContent } from "@/components/ui/Card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        console.log(
          "[AuthLayout] User is authenticated, redirecting to dashboard"
        );
        router.replace("/dashboard");
      } else {
        console.log(
          "[AuthLayout] User is not authenticated, showing login page"
        );
      }
    }
  }, [user, loading, router]);

  if (loading) {
    console.log("[AuthLayout] Loading...");
    return <FullPageSpinner />;
  }

  if (user) {
    console.log("[AuthLayout] User exists, waiting for redirect...");
    return <FullPageSpinner />;
  }

  console.log("[AuthLayout] Rendering login page");
  return (
    <div className="min-h-screen" suppressHydrationWarning>
      {children}
    </div>
  );
}
