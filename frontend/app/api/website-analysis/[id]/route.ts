import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const { id } = params;
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
    const endpoint = `${baseApiUrl}/api/v1/website-analysis/${id}`;

    console.log("Fetching analysis results from:", endpoint);

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        return NextResponse.json(
          { message: "Unauthorized - Please login first" },
          { status: 401 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          { message: "Analysis not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: errorData?.message || "Failed to fetch analysis results",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("API Response Data:", data);
    console.log("API Response Results:", data.data?.results);

    // Ensure the data structure is correct
    if (data.data && data.data.results) {
      // Make sure uptime data is properly structured if it exists
      if (data.data.results.uptime) {
        console.log("Uptime data found:", data.data.results.uptime);
      } else {
        console.log("No uptime data in results");
      }
    }

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - Please login first",
        },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log("[Delete API] API URL:", apiUrl);

    if (!apiUrl) {
      throw new Error("API URL not configured");
    }

    // Remove trailing slash from API URL if present
    const baseApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const endpoint = `${baseApiUrl}/api/v1/website-analysis/${id}`;
    console.log("[Delete API] Deleting analysis at:", endpoint);

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[Delete API] Response status:", response.status);

    let responseText;
    try {
      responseText = await response.text();
      console.log("[Delete API] Raw response text:", responseText);
    } catch (error) {
      console.error("[Delete API] Error reading response text:", error);
      throw new Error("Failed to read backend response");
    }

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : null;
      console.log("[Delete API] Parsed response data:", data);
    } catch (error) {
      console.error("[Delete API] Error parsing JSON:", error);
      console.error("[Delete API] Invalid JSON response:", responseText);
      throw new Error("Invalid response format from backend");
    }

    if (!response.ok) {
      console.error("[Delete API] Error response:", data);
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Failed to delete analysis",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error: any) {
    console.error("[Delete API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete analysis",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
