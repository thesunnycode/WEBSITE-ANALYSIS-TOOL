import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for updates
const UpdateMonitorSchema = z.object({
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
  interval: z.number().min(60).max(3600).optional(),
  locations: z.array(z.string()).optional(),
  notifications: z
    .object({
      email: z
        .object({
          enabled: z.boolean(),
          recipients: z.array(z.string().email()),
        })
        .optional(),
      webhook: z
        .object({
          enabled: z.boolean(),
          url: z.string().url().optional(),
        })
        .optional(),
      slack: z
        .object({
          enabled: z.boolean(),
          channel: z.string().optional(),
        })
        .optional(),
      thresholds: z
        .object({
          responseTime: z.number().min(0),
          downtime: z.number().min(0),
        })
        .optional(),
    })
    .optional(),
});

// GET /api/monitors/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Replace with actual database query
    const monitor = {
      id,
      name: "Main Website",
      url: "https://example.com",
      status: "up",
      uptime: {
        percentage: 99.98,
        last24h: 100,
        last7d: 99.95,
        last30d: 99.98,
      },
      responseTime: {
        current: 245,
        average: 267,
        history: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(
            Date.now() - (23 - i) * 60 * 60 * 1000
          ).toISOString(),
          value: 200 + Math.random() * 100,
        })),
      },
      ssl: {
        valid: true,
        issuer: "Let's Encrypt Authority X3",
        expiresAt: new Date(
          Date.now() + 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
        daysUntilExpiry: 60,
      },
      dns: {
        records: [
          {
            type: "A",
            name: "example.com",
            value: "192.0.2.1",
            ttl: 3600,
          },
          {
            type: "CNAME",
            name: "www.example.com",
            value: "example.com",
            ttl: 3600,
          },
        ],
        lastCheck: new Date().toISOString(),
        status: "ok",
      },
      incidents: [
        {
          id: "1",
          startTime: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endTime: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000
          ).toISOString(),
          duration: 15,
          status: "resolved",
          description: "High response time detected",
        },
      ],
    };

    if (!monitor) {
      return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
    }

    return NextResponse.json(monitor);
  } catch (error) {
    console.error("Error fetching monitor:", error);
    return NextResponse.json(
      { error: "Failed to fetch monitor" },
      { status: 500 }
    );
  }
}

// PATCH /api/monitors/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate request body
    const validatedData = UpdateMonitorSchema.parse(body);

    // TODO: Update in database
    const updatedMonitor = {
      id,
      ...validatedData,
      status: "up",
      lastChecked: new Date().toISOString(),
    };

    return NextResponse.json(updatedMonitor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating monitor:", error);
    return NextResponse.json(
      { error: "Failed to update monitor" },
      { status: 500 }
    );
  }
}

// DELETE /api/monitors/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Delete from database
    // await db.monitors.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting monitor:", error);
    return NextResponse.json(
      { error: "Failed to delete monitor" },
      { status: 500 }
    );
  }
}
