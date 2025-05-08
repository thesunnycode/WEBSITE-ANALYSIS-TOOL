import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schemas
const MonitorSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  interval: z.number().min(60).max(3600),
  locations: z.array(z.string()),
  notifications: z.object({
    email: z.object({
      enabled: z.boolean(),
      recipients: z.array(z.string().email()),
    }),
    webhook: z.object({
      enabled: z.boolean(),
      url: z.string().url().optional(),
    }),
    slack: z.object({
      enabled: z.boolean(),
      channel: z.string().optional(),
    }),
    thresholds: z.object({
      responseTime: z.number().min(0),
      downtime: z.number().min(0),
    }),
  }),
});

// GET /api/monitors
export async function GET() {
  try {
    // TODO: Replace with actual database query
    const monitors = [
      {
        id: "1",
        name: "Main Website",
        url: "https://example.com",
        status: "up",
        uptime: 99.98,
        lastChecked: new Date().toISOString(),
        responseTime: 245,
        hasAlerts: false,
      },
      // Add more mock data as needed
    ];

    return NextResponse.json(monitors);
  } catch (error) {
    console.error("Error fetching monitors:", error);
    return NextResponse.json(
      { error: "Failed to fetch monitors" },
      { status: 500 }
    );
  }
}

// POST /api/monitors
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = MonitorSchema.parse(body);

    // TODO: Save to database
    const newMonitor = {
      id: Math.random().toString(36).substr(2, 9),
      ...validatedData,
      status: "up",
      uptime: 100,
      lastChecked: new Date().toISOString(),
      responseTime: 0,
      hasAlerts: false,
    };

    return NextResponse.json(newMonitor, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating monitor:", error);
    return NextResponse.json(
      { error: "Failed to create monitor" },
      { status: 500 }
    );
  }
}
