import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Mock data for testing
const mockAnalysis = {
  _id: "1",
  url: "https://example.com",
  score: 85,
  wcagCompliance: {
    level: "AA",
    percentage: 85,
    status: "partial",
  },
  issuesByPriority: {
    high: 2,
    medium: 3,
    low: 5,
  },
  issues: [
    {
      id: "1",
      type: "alt-text",
      description: "Images missing alternative text",
      priority: "high",
      wcagGuideline: "WCAG 2.1 Success Criterion 1.1.1 Non-text Content",
      affectedElements: [
        {
          selector: "img.hero-image",
          html: '<img src="hero.jpg" class="hero-image">',
        },
        {
          selector: "img.product-image",
          html: '<img src="product.jpg" class="product-image">',
        },
      ],
      remediation: {
        steps: [
          "Add descriptive alt text to all images",
          "Ensure alt text conveys the image's purpose or content",
          "Use empty alt attributes for decorative images",
        ],
        resources: [
          {
            title: "Alt Text Best Practices",
            url: "https://www.w3.org/WAI/tutorials/images/",
          },
          {
            title: "Writing Effective Alt Text",
            url: "https://webaim.org/techniques/alttext/",
          },
        ],
      },
    },
    {
      id: "2",
      type: "contrast",
      description: "Insufficient color contrast in navigation menu",
      priority: "high",
      wcagGuideline: "WCAG 2.1 Success Criterion 1.4.3 Contrast (Minimum)",
      affectedElements: [
        {
          selector: "nav a",
          html: '<a href="#" style="color: #777777">Menu Item</a>',
        },
      ],
      remediation: {
        steps: [
          "Increase contrast ratio to at least 4.5:1 for normal text",
          "Use darker text colors or lighter background colors",
          "Test contrast using a color contrast analyzer",
        ],
        resources: [
          {
            title: "Understanding WCAG Contrast Requirements",
            url: "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html",
          },
          {
            title: "Color Contrast Checker",
            url: "https://webaim.org/resources/contrastchecker/",
          },
        ],
      },
    },
  ],
  scanDate: new Date().toISOString(),
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { message: "API URL not configured" },
        { status: 500 }
      );
    }

    // Remove trailing slash if present
    const baseApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const accessibilityEndpoint = `${baseApiUrl}/api/v1/accessibility/${params.id}/analyze`;

    const body = await request.json();

    const response = await fetch(accessibilityEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          message: errorData.message || "Failed to start accessibility analysis",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error: any) {
    console.error("Accessibility API error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { message: "API URL not configured" },
        { status: 500 }
      );
    }

    // Remove trailing slash if present
    const baseApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const accessibilityEndpoint = `${baseApiUrl}/api/v1/accessibility/${params.id}`;

    const response = await fetch(accessibilityEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          message: errorData.message || "Failed to fetch accessibility data",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error: any) {
    console.error("Accessibility API error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
