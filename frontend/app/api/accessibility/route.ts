import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Mock data for testing
const mockAnalyses = [
  {
    _id: "1",
    url: "https://example.com",
    score: 85,
    wcagCompliance: {
      level: "AA",
      percentage: 85,
      status: "partial",
    },
    scanDate: new Date().toISOString(),
  },
  {
    _id: "2",
    url: "https://test-site.com",
    score: 95,
    wcagCompliance: {
      level: "AAA",
      percentage: 95,
      status: "compliant",
    },
    scanDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
];

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = await cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    // For testing, return mock data
    return NextResponse.json({ success: true, data: mockAnalyses });

    /* Uncomment this when backend is ready
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { message: "API URL not configured" },
        { status: 500 }
      );
    }

    // Remove trailing slash if present
    const baseApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const accessibilityEndpoint = `${baseApiUrl}/api/v1/accessibility`;

    const response = await fetch(accessibilityEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          message: errorData.message || "Failed to fetch accessibility data",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
    */
  } catch (error: any) {
    console.error("Accessibility API error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
