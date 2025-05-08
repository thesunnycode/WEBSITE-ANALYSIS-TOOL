import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// This is a mock implementation. In a real application, you would:
// 1. Connect to your database
// 2. Fetch the actual analysis results
// 3. Return real data

const mockResults = {
  performance: 92,
  seo: 88,
  security: 95,
  accessibility: 90,
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await Promise.resolve(params.id);
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
      throw new Error("API URL not configured");
    }

    // Remove trailing slash from API URL if present
    const baseApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const endpoint = `${baseApiUrl}/api/website-analysis/${id}`;
    console.log("Fetching analysis results from:", endpoint);

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Invalid response format:", textResponse);
      throw new Error(
        `Invalid response from server (${response.status}). Please try again later.`
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend error details:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });
      return NextResponse.json(
        {
          message: errorData?.message || "Failed to fetch analysis results",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Analysis results fetched successfully:", data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Analysis fetch error:", error);
    return NextResponse.json(
      {
        message: error.message || "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
