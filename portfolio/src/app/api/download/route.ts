import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") || "tr";
  const filename = lang === "en" ? "cv_en.pdf" : "cv.pdf";
  const pdfPath = join(process.cwd(), "..", "output", filename);

  if (!existsSync(pdfPath)) {
    return NextResponse.json({ error: "PDF bulunamadı" }, { status: 404 });
  }

  const pdf = readFileSync(pdfPath);

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
