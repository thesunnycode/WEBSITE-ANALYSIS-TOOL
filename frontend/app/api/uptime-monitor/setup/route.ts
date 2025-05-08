import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { url, checkFrequency } = await req.json();

    if (!url || !checkFrequency) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Add validation for URL format and check frequency

    // Call backend API to setup monitoring
    const response = await fetch(`${process.env.BACKEND_URL}/api/uptime-monitor/setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ url, checkFrequency }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to setup monitoring");
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Uptime monitor setup error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
} 