import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { profile, variant = "general" } = await req.json();

    if (!profile) {
      return NextResponse.json({ error: "Profil verisi eksik" }, { status: 400 });
    }

    // Profili kaydet
    const cvDir = join(process.cwd(), "..");
    const dataDir = join(cvDir, "data");
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(
      join(dataDir, "profile_web.json"),
      JSON.stringify(profile, null, 2),
      "utf-8"
    );

    // Python script ile CV üret
    const scriptPath = join(cvDir, "cv_generator", "web_generate.py");
    const { stdout, stderr } = await execAsync(
      `cd "${cvDir}" && python3 "${scriptPath}" ${variant}`,
      {
        timeout: 120000,
        env: {
          ...process.env,
          PATH: `/Library/TeX/texbin:${process.env.PATH || ""}`,
        },
      }
    );

    if (stderr && !stdout.includes("DONE:")) {
      console.error("CV generate stderr:", stderr);
    }

    if (!stdout.includes("DONE:")) {
      throw new Error(`PDF üretilemedi.\n${stderr || stdout}`);
    }

    return NextResponse.json({ success: true, variant });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "CV üretim hatası";
    console.error("Generate-cv error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
