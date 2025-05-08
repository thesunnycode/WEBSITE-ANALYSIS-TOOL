import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = searchParams.get("days") || "30";

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/uptime-monitor/stats?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch monitor statistics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch monitor statistics" },
      { status: 500 }
    );
  }
} 