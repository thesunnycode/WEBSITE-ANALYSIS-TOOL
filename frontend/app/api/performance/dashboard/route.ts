import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    // For now, return mock data
    // In production, this would fetch from your backend API
    const mockData = {
      success: true,
      data: {
        coreWebVitals: {
          lcp: 2.1, // seconds
          fid: 85, // milliseconds
          cls: 0.08,
        },
        loadingMetrics: {
          ttfb: 180, // milliseconds
          fcp: 1200, // milliseconds
          speedIndex: 2500, // milliseconds
        },
        resourceUsage: {
          jsBundleSize: 245, // KB
          imageLoadTime: 850, // milliseconds
          cssOverhead: 45, // KB
        },
        historicalData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(
            Date.now() - (29 - i) * 24 * 60 * 60 * 1000
          ).toISOString(),
          lcp: 2.0 + Math.random() * 0.5,
          fid: 80 + Math.random() * 20,
          cls: 0.05 + Math.random() * 0.08,
          ttfb: 150 + Math.random() * 100,
          fcp: 1100 + Math.random() * 300,
          speedIndex: 2300 + Math.random() * 500,
        })),
        recommendations: [
          {
            id: "1",
            title: "Optimize Image Loading",
            description:
              "Implement lazy loading for images below the fold to improve initial page load time.",
            priority: "high",
            category: "optimization",
            impact: 85,
          },
          {
            id: "2",
            title: "Implement Browser Caching",
            description:
              "Set up proper cache headers for static assets to reduce server load and improve load times.",
            priority: "medium",
            category: "caching",
            impact: 75,
          },
          {
            id: "3",
            title: "Minimize JavaScript",
            description:
              "Reduce JavaScript bundle size by removing unused code and implementing code splitting.",
            priority: "high",
            category: "resources",
            impact: 90,
          },
          {
            id: "4",
            title: "Optimize CSS Delivery",
            description:
              "Inline critical CSS and defer non-critical styles to improve render times.",
            priority: "medium",
            category: "optimization",
            impact: 70,
          },
        ],
      },
    };

    return NextResponse.json(mockData);
  } catch (error: any) {
    console.error("[Performance API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
