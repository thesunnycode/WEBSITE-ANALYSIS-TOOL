import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function safeJsonParse(response: Response) {
  try {
    const text = await response.text();
    console.log("Raw response text:", text);
    try {
      return text ? JSON.parse(text) : null;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Failed to parse response text:", text);
      return null;
    }
  } catch (error) {
    console.error("Error reading response:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, options } = body;

    console.log("Received request body:", { url, options });

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      console.error("No authentication token found");
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
    console.log("Backend API URL:", apiUrl);

    if (!apiUrl) {
      console.error("API URL is not configured in environment variables");
      return NextResponse.json(
        {
          message:
            "API URL not configured. Please check your environment variables.",
          details: "NEXT_PUBLIC_API_URL is missing",
        },
        { status: 500 }
      );
    }

    // Remove trailing slash from API URL if present
    const baseApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;

    // Step 1: Create the initial website analysis
    const createAnalysisEndpoint = `${baseApiUrl}/api/v1/website-analysis/analyze`;
    console.log("Creating website analysis at:", createAnalysisEndpoint);
    console.log("Request body:", { url, options });
    console.log("Auth token present:", !!token);

    try {
      // Create the initial analysis
      const createAnalysisResponse = await fetch(createAnalysisEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          options: options.map((opt) => opt.toLowerCase()),
        }),
      }).catch((error) => {
        console.error("Network error during fetch:", error);
        throw new Error(`Network error: ${error.message}`);
      });

      console.log("Response status:", createAnalysisResponse.status);
      console.log(
        "Response headers:",
        Object.fromEntries(createAnalysisResponse.headers.entries())
      );

      let analysisData;
      try {
        const responseText = await createAnalysisResponse.text();
        console.log("Raw response text:", responseText);
        analysisData = responseText ? JSON.parse(responseText) : null;
        console.log("Parsed analysis data:", analysisData);
      } catch (error) {
        console.error("Error parsing response:", error);
        return NextResponse.json(
          {
            message: "Failed to parse server response",
            details: "The server returned an invalid JSON response",
          },
          { status: 500 }
        );
      }

      if (!createAnalysisResponse.ok) {
        console.error("Server error response:", {
          status: createAnalysisResponse.status,
          data: analysisData,
          endpoint: createAnalysisEndpoint,
        });

        // Handle different status codes with more detailed messages
        switch (createAnalysisResponse.status) {
          case 400:
            return NextResponse.json(
              {
                message: "Invalid request. Please check your input.",
                details:
                  analysisData?.error ||
                  analysisData?.message ||
                  "The server could not process the request",
                endpoint: createAnalysisEndpoint,
              },
              { status: 400 }
            );
          case 401:
            return NextResponse.json(
              {
                message: "Unauthorized - Please login first",
                details:
                  analysisData?.error ||
                  analysisData?.message ||
                  "Invalid or expired token",
                endpoint: createAnalysisEndpoint,
              },
              { status: 401 }
            );
          case 404:
            return NextResponse.json(
              {
                message: "Analysis service not found",
                details: `Attempted to reach ${createAnalysisEndpoint}. Please ensure the backend server is running.`,
                endpoint: createAnalysisEndpoint,
              },
              { status: 404 }
            );
          case 500:
            return NextResponse.json(
              {
                message: "Internal server error",
                details:
                  analysisData?.error ||
                  analysisData?.message ||
                  "The server encountered an error while processing the request",
                endpoint: createAnalysisEndpoint,
              },
              { status: 500 }
            );
          default:
            return NextResponse.json(
              {
                message: `Server error (${createAnalysisResponse.status})`,
                details: {
                  error:
                    analysisData?.error ||
                    analysisData?.message ||
                    "Unknown error",
                  endpoint: createAnalysisEndpoint,
                  status: createAnalysisResponse.status,
                },
              },
              { status: createAnalysisResponse.status }
            );
        }
      }

      if (!analysisData) {
        console.error("Empty response received");
        return NextResponse.json(
          {
            message: "Empty response from server",
            details: { status: createAnalysisResponse.status },
          },
          { status: 500 }
        );
      }

      // Extract analysis ID from the correct path in the response
      const analysisId = analysisData?.data?.id || analysisData?.data?._id;
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

      // Step 2: Start each selected analysis type
      const analysisPromises = options.map(async (option) => {
        const optionType = option.toLowerCase();

        // Check if the analysis type is implemented
        const validOptions = [
          "performance",
          "security",
          "seo",
          "uptime",
          "ai-insights",
        ];
        if (!validOptions.includes(optionType)) {
          return {
            type: optionType,
            success: false,
            error: `Analysis type '${optionType}' is not yet implemented`,
          };
        }

        const endpoint = `${baseApiUrl}/api/v1/${optionType}/${analysisId}/analyze`;
        console.log(`Starting ${optionType} analysis at:`, endpoint);

        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            body: JSON.stringify({ url: url.trim() }),
          });

          let analysisTypeData;
          try {
            const responseText = await response.text();
            console.log(`${optionType} raw response:`, responseText);
            analysisTypeData = responseText ? JSON.parse(responseText) : null;
          } catch (error) {
            console.error(`Error parsing ${optionType} response:`, error);
            return {
              type: optionType,
              success: false,
              error: "Invalid response format",
            };
          }

          if (!response.ok) {
            console.error(`${optionType} analysis failed:`, {
              status: response.status,
              data: analysisTypeData,
            });

            return {
              type: optionType,
              success: false,
              error:
                analysisTypeData?.message ||
                `Failed to start ${optionType} analysis`,
            };
          }

          return {
            type: optionType,
            success: true,
            data: analysisTypeData,
          };
        } catch (error: any) {
          console.error(`Error in ${optionType} analysis:`, error);
          return {
            type: optionType,
            success: false,
            error: error.message || `Failed to start ${optionType} analysis`,
          };
        }
      });

      // Wait for all analyses to start
      const results = await Promise.all(analysisPromises);
      console.log("All analysis results:", results);

      // Check if any analysis succeeded
      const anySuccess = results.some((result) => result.success);
      if (!anySuccess) {
        const errors = results
          .map((result) => `${result.type}: ${result.error}`)
          .join("; ");

        return NextResponse.json(
          {
            message: "All analysis types failed to start",
            details: errors,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        data: {
          id: analysisId,
          results,
        },
        message: "Analysis started successfully",
      });
    } catch (fetchError: any) {
      console.error("Fetch error details:", {
        message: fetchError.message,
        stack: fetchError.stack,
      });
      return NextResponse.json(
        {
          message: "Failed to connect to the backend server",
          details: fetchError.message,
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("Analysis start error:", {
      message: error.message,
      stack: error.stack,
    });
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
