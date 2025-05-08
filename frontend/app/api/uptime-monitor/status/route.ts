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
    const monitorId = searchParams.get("monitorId");

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/uptime-monitor/status${
        monitorId ? `?monitorId=${monitorId}` : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch monitor status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch monitor status" },
      { status: 500 }
    );
  }
} 