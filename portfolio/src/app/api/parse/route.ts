import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "Fotoğraf yüklenmedi" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Tüm fotoğrafları base64'e çevir
    const imageParts = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        return {
          inlineData: {
            data: base64,
            mimeType: file.type || "image/png",
          },
        };
      })
    );

    const prompt = `Bu LinkedIn profil ekran görüntülerinden tüm bilgileri çıkar.
Türkçe karakterleri (ç, ş, ğ, ı, ö, ü, İ, Ş, Ğ) doğru kullan.
LinkedIn'deki metni BİREBİR kullan, değiştirme.

Aşağıdaki JSON formatında döndür (başka bir şey yazma, sadece JSON):
{
  "full_name": "İsim Soyisim",
  "headline": "Başlık",
  "location": "Konum",
  "email": "email",
  "phone": "telefon",
  "linkedin_url": "linkedin URL",
  "about": "Hakkında metni (tam metin)",
  "skills": ["yetenek1", "yetenek2"],
  "experiences": [
    {
      "company": "Şirket adı",
      "title": "Pozisyon",
      "employment_type": "Tam zamanlı/Stajyer/vb",
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
      "grade": "Not (varsa)"
    }
  ],
  "certifications": [
    {"name": "Sertifika adı", "authority": "Veren kurum", "date": "Tarih"}
  ],
  "projects": [
    {"title": "Proje adı", "start_date": "Başlangıç", "end_date": "Bitiş", "description": "Açıklama"}
  ],
  "awards": [
    {"title": "Ödül adı", "issuer": "Veren kurum", "date": "Tarih", "description": "Açıklama"}
  ],
  "languages": [
    {"name": "Dil", "level": "Seviye"}
  ]
}`;

    const result = await model.generateContent([prompt, ...imageParts]);
    const text = result.response.text();

    // JSON parse et (bazen markdown code block içinde gelir)
    let jsonStr = text;
    const jsonMatch = text.match(/```json?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const profile = JSON.parse(jsonStr);

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: error.message || "Parse hatası" },
      { status: 500 }
    );
  }
}
