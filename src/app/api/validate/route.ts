import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");
    if (!isMultipart) {
      return NextResponse.json(
        { ok: false, errors: ["Expected multipart/form-data"] },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const dataset = formData.get("dataset");
    const patterns = formData.get("patterns");

    const errors: string[] = [];
    if (!(dataset instanceof File)) {
      errors.push("Missing dataset file");
    }
    if (!(patterns instanceof File)) {
      errors.push("Missing patterns file");
    }

    // Placeholder validation: check extensions and non-empty size
    if (dataset instanceof File) {
      const name = dataset.name.toLowerCase();
      if (!name.endsWith(".csv")) errors.push("Dataset must be a .csv file");
      if (dataset.size === 0) errors.push("Dataset file is empty");
    }
    if (patterns instanceof File) {
      const name = patterns.name.toLowerCase();
      if (!name.endsWith(".csv")) errors.push("Patterns must be a .csv file");
      if (patterns.size === 0) errors.push("Patterns file is empty");
    }

    if (errors.length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: "Files validated (placeholder)" });
  } catch {
    return NextResponse.json(
      { ok: false, errors: ["Unexpected error during validation"] },
      { status: 500 }
    );
  }
}


