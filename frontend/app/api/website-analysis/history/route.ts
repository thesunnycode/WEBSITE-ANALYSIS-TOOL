import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized - Please login first" },
      { status: 401 }
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { message: "API URL not configured" },
      { status: 500 }
    );
  }

  // Remove trailing slash if present
  const baseApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
  const endpoint = `${baseApiUrl}/api/v1/website-analysis/history`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch analysis history" },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Map backend data to frontend format if needed
    return NextResponse.json({ analyses: data.analyses || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
} 