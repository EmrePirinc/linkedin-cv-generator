import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json();

    // Profile'ı kaydet
    const dataDir = join(process.cwd(), "..", "data");
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(
      join(dataDir, "profile_web.json"),
      JSON.stringify(profile, null, 2),
      "utf-8"
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
