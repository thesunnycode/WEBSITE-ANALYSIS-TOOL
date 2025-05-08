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
    const days = searchParams.get("days") || "7";
    const monitorId = searchParams.get("monitorId");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/uptime-monitor/notifications?days=${days}${
        monitorId ? `&monitorId=${monitorId}` : ""
      }&page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch monitor notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch monitor notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/uptime-monitor/notifications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to create monitor notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create monitor notification" },
      { status: 500 }
    );
  }
} 