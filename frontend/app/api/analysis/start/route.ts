import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, options } = body;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    if (!url) {
      return NextResponse.json({ message: "URL is required" }, { status: 400 });
    }

    if (!options || !Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { message: "At least one analysis option is required" },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log("API URL:", apiUrl); // Log the API URL

    if (!apiUrl) {
      return NextResponse.json(
        {
          message:
            "API URL not configured. Please check your environment variables.",
        },
        { status: 500 }
      );
    }

    // Remove trailing slash from API URL if present
    const baseApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const createAnalysisEndpoint = `${baseApiUrl}/api/website-analysis`;

    console.log("Creating website analysis at:", createAnalysisEndpoint);
    console.log("Request headers:", {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.substring(0, 10)}...`, // Log partial token for security
    });
    console.log("Request body:", { url });

    const createAnalysisResponse = await fetch(createAnalysisEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url,
        options: options.map((opt) => opt.toLowerCase()), // Send options array
      }),
    });

    // Log response details for debugging
    console.log(
      "Create analysis response status:",
      createAnalysisResponse.status
    );
    console.log(
      "Create analysis response headers:",
      Object.fromEntries(createAnalysisResponse.headers.entries())
    );

    // Handle 404 error specifically
    if (createAnalysisResponse.status === 404) {
      console.error("API endpoint not found:", createAnalysisEndpoint);
      return NextResponse.json(
        {
          message:
            "API endpoint not found. Please verify your API configuration.",
          details: `Attempted to reach: ${createAnalysisEndpoint}`,
        },
        { status: 404 }
      );
    }

    let analysisData;
    try {
      analysisData = await createAnalysisResponse.json();
      console.log("Raw analysis response:", analysisData);
    } catch (error) {
      console.error("Failed to parse analysis response:", error);
      return NextResponse.json(
        {
          message: "Failed to parse server response",
          details: "The server returned an invalid JSON response",
        },
        { status: 500 }
      );
    }

    if (!createAnalysisResponse.ok) {
      console.error("Create analysis error:", analysisData);
      return NextResponse.json(
        {
          message: analysisData?.message || "Failed to create analysis",
          details: analysisData,
        },
        { status: createAnalysisResponse.status }
      );
    }

    // Validate the response structure
    if (!analysisData || typeof analysisData !== "object") {
      console.error("Invalid analysis response format:", analysisData);
      return NextResponse.json(
        {
          message: "Invalid response format from server",
          details: analysisData,
        },
        { status: 500 }
      );
    }

    // Extract the analysis ID
    const analysisId = analysisData.data?.id;
    if (!analysisId) {
      console.error("Missing analysis ID in response:", analysisData);
      return NextResponse.json(
        {
          message: "Invalid response: missing analysis ID",
          details: analysisData,
        },
        { status: 500 }
      );
    }

    // Then start each selected analysis type
    const analysisPromises = options.map(async (option) => {
      const optionType = option.toLowerCase();
      const endpoint = `${baseApiUrl}/api/${optionType}/${analysisId}/analyze`;
      console.log(`Starting ${optionType} analysis at:`, endpoint);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url }),
        });

        let analysisResponse;
        try {
          analysisResponse = await response.json();
        } catch (error) {
          console.error(
            `Failed to parse ${optionType} analysis response:`,
            error
          );
          return {
            type: optionType,
            success: false,
            error: "Invalid response format",
          };
        }

        if (!response.ok) {
          console.error(`${optionType} analysis failed:`, analysisResponse);
          return {
            type: optionType,
            success: false,
            error:
              analysisResponse?.message ||
              `Failed to start ${optionType} analysis`,
          };
        }

        return {
          type: optionType,
          success: true,
          data: analysisResponse.data || analysisResponse,
        };
      } catch (error: any) {
        console.error(`Error starting ${optionType} analysis:`, error);
        return {
          type: optionType,
          success: false,
          error: error.message || `Failed to start ${optionType} analysis`,
        };
      }
    });

    // Wait for all analyses to start
    const results = await Promise.all(analysisPromises);
    console.log("All analyses started:", results);

    // Check if any analysis failed to start
    const failedAnalyses = results.filter((result) => !result.success);
    if (failedAnalyses.length > 0) {
      console.error("Some analyses failed to start:", failedAnalyses);
    }

    return NextResponse.json({
      analysisId,
      message: "Analysis started successfully",
      results,
    });
  } catch (error: any) {
    console.error("Analysis start error:", error);
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
