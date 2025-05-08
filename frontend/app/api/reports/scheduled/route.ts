import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";

// Validation schema for scheduled reports
const ScheduledReportSchema = z.object({
  name: z.string().min(1, "Report name is required"),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  time: z.string(),
  recipients: z.array(z.string().email()),
  status: z.enum(["active", "paused"]).default("active"),
});

// GET /api/reports/scheduled
export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    // Mock data for testing
    const scheduledReports = [
      {
        id: "1",
        name: "Daily Performance Report",
        frequency: "daily",
        time: "08:00",
        recipients: ["team@example.com", "manager@example.com"],
        lastRun: "2024-03-15 08:00:00",
        nextRun: "2024-03-16 08:00:00",
        status: "active",
      },
      {
        id: "2",
        name: "Weekly Security Summary",
        frequency: "weekly",
        time: "09:00",
        recipients: ["security@example.com"],
        lastRun: "2024-03-11 09:00:00",
        nextRun: "2024-03-18 09:00:00",
        status: "active",
      },
    ];

    return NextResponse.json({ success: true, data: scheduledReports });
  } catch (error: any) {
    console.error("Error fetching scheduled reports:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/reports/scheduled
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = ScheduledReportSchema.parse(body);

    // Calculate next run time based on frequency and time
    const nextRun = calculateNextRun(
      validatedData.frequency,
      validatedData.time
    );

    // Mock scheduled report creation
    const scheduledReport = {
      id: Math.random().toString(36).substr(2, 9),
      ...validatedData,
      lastRun: null,
      nextRun: nextRun.toISOString(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, data: scheduledReport },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Invalid request data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error creating scheduled report:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to calculate next run time
function calculateNextRun(frequency: string, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const now = new Date();
  const nextRun = new Date();
  nextRun.setHours(hours, minutes, 0, 0);

  if (nextRun <= now) {
    switch (frequency) {
      case "daily":
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case "weekly":
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case "monthly":
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }
  }

  return nextRun;
}
