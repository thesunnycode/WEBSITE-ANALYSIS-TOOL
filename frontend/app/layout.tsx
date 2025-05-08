import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import ClientLayoutWithSidebar from "@/components/layout/ClientLayoutWithSidebar";

// Optimize font loading with display: swap for better UX during font loading
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap" 
});

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-plus-jakarta",
  display: "swap" 
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-jetbrains",
  display: "swap" 
});

export const metadata: Metadata = {
  title: {
    template: "%s | Website Analysis Tool",
    default: "Website Analysis Tool"
  },
  description: "Comprehensive website analysis and monitoring tool for SEO, performance, and security",
  keywords: ["website analysis", "SEO", "performance monitoring", "web analytics"],
  authors: [{ name: "Your Company Name" }],
  creator: "Your Company Name",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com",
    title: "Website Analysis Tool",
    description: "Comprehensive website analysis and monitoring tool",
    siteName: "Website Analysis Tool"
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Analysis Tool",
    description: "Comprehensive website analysis and monitoring tool"
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" }
  ],
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen font-sans antialiased bg-background text-foreground">
        <Providers>
          <AuthProvider>
            <ClientLayoutWithSidebar>{children}</ClientLayoutWithSidebar>
          </AuthProvider>
        </Providers>
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
    </html>
  );
}