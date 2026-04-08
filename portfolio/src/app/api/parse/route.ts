import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { analyzePhotos } from "@/lib/parallel-analyzer";
import { checkSections, applyManualCorrections } from "@/lib/section-checker";

const EXTRACT_PROMPT = `Bu LinkedIn profil ekran görüntülerinden tüm bilgileri çıkar.
Türkçe karakterleri (ç, ş, ğ, ı, ö, ü, İ, Ş, Ğ) doğru kullan.
LinkedIn'deki metni BİREBİR kullan — değiştirme, düzeltme, güzelleştirme YAPMA.

SADECE aşağıdaki JSON formatında döndür (başka hiçbir şey yazma):
{
  "full_name": "İsim Soyisim",
  "headline": "Başlık",
  "location": "Konum",
  "email": "",
  "phone": "",
  "linkedin_url": "",
  "github_url": "",
  "about": "Hakkında tam metni",
  "skills": ["yetenek1", "yetenek2"],
  "experiences": [
    {
      "company": "Şirket adı",
      "title": "Pozisyon",
      "employment_type": "Tam zamanlı",
      "start_date": "Başlangıç",
      "end_date": "Bitiş veya Devam Ediyor",
      "location": "Konum",
      "description": "Açıklama"
    }
  ],
  "education": [
    {
      "school": "Okul adı",
      "degree": "Derece",
      "field_of_study": "Alan",
      "start_date": "Başlangıç",
      "end_date": "Bitiş",
      "grade": ""
    }
  ],
  "certifications": [
    {"name": "Sertifika adı", "authority": "Veren kurum", "date": "Tarih"}
  ],
  "projects": [
    {"title": "Proje adı", "start_date": "", "end_date": "", "description": "Açıklama"}
  ],
  "awards": [
    {"title": "Ödül adı", "issuer": "Veren kurum", "date": "Tarih", "description": "Açıklama"}
  ],
  "languages": [
    {"name": "Dil", "level": "Seviye"}
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const manualLabelsRaw = formData.get("manualLabels") as string | null;
    const manualCorrections: Record<number, string> = manualLabelsRaw
      ? JSON.parse(manualLabelsRaw)
      : {};

    if (files.length === 0) {
      return NextResponse.json({ error: "Fotoğraf yüklenmedi" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY tanımlı değil" }, { status: 500 });
    }

    // Fotoğrafları base64'e çevir
    const photos = await Promise.all(
      files.map(async (file, i) => {
        const bytes = await file.arrayBuffer();
        return {
          base64: Buffer.from(bytes).toString("base64"),
          mimeType: file.type || "image/png",
          fileName: file.name || `photo_${i + 1}`,
        };
      })
    );

    // ADIM 1: Bölüm tespiti (paralel)
    let detections = await analyzePhotos(photos, apiKey);

    // Manuel düzeltmeleri uygula
    if (Object.keys(manualCorrections).length > 0) {
      detections = applyManualCorrections(detections, manualCorrections);
    }

    // ADIM 2: Bölüm kontrolü
    const sectionCheck = checkSections(detections);

    // Zorunlu bölüm eksikse veri çıkarmadan dön
    if (!sectionCheck.canProceed) {
      return NextResponse.json({ detections, sectionCheck, profile: null });
    }

    // ADIM 3: Veri çıkarımı (tüm fotoğraflar birlikte)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imageParts = photos.map((p) => ({
      inlineData: { data: p.base64, mimeType: p.mimeType },
    }));

    const result = await model.generateContent([EXTRACT_PROMPT, ...imageParts]);
    const text = result.response.text();

    const jsonMatch = text.match(/```json?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : text;
    const profile = JSON.parse(jsonStr);

    return NextResponse.json({ detections, sectionCheck, profile });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Parse hatası";
    console.error("Parse error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
