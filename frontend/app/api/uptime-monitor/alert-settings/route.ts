import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/uptime-monitor/alert-settings`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch alert settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch alert settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
      `${process.env.BACKEND_URL}/api/uptime-monitor/alert-settings`,
      {
        method: "PUT",
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
    console.error("Failed to update alert settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update alert settings" },
      { status: 500 }
    );
  }
} 