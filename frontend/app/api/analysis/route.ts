import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, options } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!options || !Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { error: "At least one analysis option is required" },
        { status: 400 }
      );
    }

    console.log("Starting analysis for URL:", url, "with options:", options);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error("API URL not configured");
    }

    const response = await fetch(`${apiUrl}/api/v1/website-analysis/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url, options }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend API error:", errorData);
      return NextResponse.json(
        { error: errorData.error || "Failed to start analysis" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Analysis started successfully:", data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in analysis route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
