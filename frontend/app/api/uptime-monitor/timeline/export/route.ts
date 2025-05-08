import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const days = searchParams.get("days") || "7";

    // Call backend API to get timeline data for export
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/uptime-monitor/timeline/export?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to export timeline data");
    }

    // Get the CSV data
    const csvData = await response.text();

    // Return the CSV file
    return new NextResponse(csvData, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="uptime-timeline-${days}-days.csv"`,
      },
    });
  } catch (error) {
    console.error("Timeline export error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
} 