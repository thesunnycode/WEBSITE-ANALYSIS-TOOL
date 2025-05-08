"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster as HotToaster } from "react-hot-toast";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Handle hydration mismatch by delaying render of theme-dependent components
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
        {mounted && (
          <HotToaster
            position="top-right"
            toastOptions={{
              className: "!bg-card !text-foreground border border-border shadow-lg",
              duration: 4000,
              success: {
                iconTheme: {
                  primary: 'hsl(var(--success))',
                  secondary: 'hsl(var(--success-foreground))',
                }
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'hsl(var(--destructive-foreground))',
                }
              }
            }}
          />
        )}
      </AuthProvider>
    </NextThemesProvider>
  );
}