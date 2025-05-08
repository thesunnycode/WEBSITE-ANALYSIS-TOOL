import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
    const aiInsightsEndpoint = `${baseApiUrl}/api/v1/ai-insights/${params.id}/analyze`;

    const body = await request.json();

    const response = await fetch(aiInsightsEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          message: errorData.message || "Failed to start AI insights analysis",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error: any) {
    console.error("AI Insights API error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
    const aiInsightsEndpoint = `${baseApiUrl}/api/v1/ai-insights/${params.id}`;

    const response = await fetch(aiInsightsEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          message: errorData.message || "Failed to fetch AI insights data",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error: any) {
    console.error("AI Insights API error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 