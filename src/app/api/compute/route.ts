import { NextResponse } from "next/server";

type ComputeResponse = {
  patterns: Array<{ id: string; label: string; criteria: Record<string, string> }>;
  results: Array<Record<string, unknown>>;
  geoData: Array<{ lat: number; lng: number; value: number; id?: string }>;
  summaryStats: Record<string, number>;
};

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");
    if (!isMultipart) {
      return NextResponse.json(
        { error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const dataset = formData.get("dataset");
    const patterns = formData.get("patterns");

    if (!(dataset instanceof File) || !(patterns instanceof File)) {
      return NextResponse.json(
        { error: "Both dataset and patterns files are required" },
        { status: 400 }
      );
    }

    // Placeholder computation: synthesize a deterministic but fake response
    const response: ComputeResponse = {
      patterns: [
        { id: "p1", label: "High Value", criteria: { amount: "> 100" } },
        { id: "p2", label: "Recent", criteria: { date: "> 2024-01-01" } },
      ],
      results: [
        { id: 1, amount: 120, date: "2025-01-15", region: "US" },
        { id: 2, amount: 80, date: "2025-02-10", region: "EU" },
      ],
      geoData: [
        { id: "US-1", lat: 37.7749, lng: -122.4194, value: 12 },
        { id: "EU-1", lat: 48.8566, lng: 2.3522, value: 8 },
      ],
      summaryStats: {
        totalRecords: 2,
        totalAmount: 200,
        avgAmount: 100,
      },
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}


