import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";

// Validation schemas
const ReportSectionSchema = z.object({
  id: z.string(),
  metric: z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    type: z.enum(["chart", "table"]),
    chartType: z.enum(["bar", "line", "pie"]).optional(),
  }),
  dateRange: z.string(),
  filters: z.array(z.string()),
});

const ReportSchema = z.object({
  name: z.string().min(1, "Report name is required"),
  sections: z.array(ReportSectionSchema),
  format: z.enum(["pdf", "excel", "csv", "json"]),
  options: z.record(z.any()).optional(),
});

const ScheduledReportSchema = z.object({
  name: z.string().min(1, "Report name is required"),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  time: z.string(),
  recipients: z.array(z.string().email()),
  sections: z.array(ReportSectionSchema),
  format: z.enum(["pdf", "excel", "csv", "json"]),
  options: z.record(z.any()).optional(),
});

// GET /api/reports
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
    const reports = [
      {
        id: "1",
        name: "Weekly Performance Report",
        sections: [
          {
            id: "perf-1",
            metric: {
              id: "performance",
              name: "Performance Metrics",
              category: "Performance",
              type: "chart",
              chartType: "line",
            },
            dateRange: "7d",
            filters: [],
          },
          {
            id: "uptime-1",
            metric: {
              id: "uptime",
              name: "Uptime Statistics",
              category: "Uptime",
              type: "chart",
              chartType: "bar",
            },
            dateRange: "7d",
            filters: [],
          },
        ],
        format: "pdf",
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ success: true, data: reports });
  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/reports
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
    const validatedData = ReportSchema.parse(body);

    // Mock report generation
    const report = {
      id: Math.random().toString(36).substr(2, 9),
      ...validatedData,
      createdAt: new Date().toISOString(),
      status: "completed",
      downloadUrl: `/api/reports/download/${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };

    return NextResponse.json({ success: true, data: report }, { status: 201 });
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

    console.error("Error generating report:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
