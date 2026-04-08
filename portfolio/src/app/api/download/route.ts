import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const FILENAME_MAP: Record<string, string> = {
  tr:     "cv_tr.pdf",
  en:     "cv_en.pdf",
  sap:    "cv_tr_sap.pdf",
  ai:     "cv_tr_ai.pdf",
  // Geriye dönük uyumluluk
  "cv_tr": "cv_tr.pdf",
  "cv_en": "cv_en.pdf",
};

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") || "tr";
  const filename = FILENAME_MAP[lang] || "cv_tr.pdf";
  const pdfPath = join(process.cwd(), "..", "output", filename);

  if (!existsSync(pdfPath)) {
    return NextResponse.json({ error: `PDF bulunamadı: ${filename}` }, { status: 404 });
  }

  const pdf = readFileSync(pdfPath);

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
