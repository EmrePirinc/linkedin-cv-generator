import { GoogleGenerativeAI } from "@google/generative-ai";

export interface DetectionResult {
  section: string;
  confidence: number;
  label_tr: string;
  label_en: string;
}

const SECTION_LABELS: Record<string, { tr: string; en: string }> = {
  profile:        { tr: "Profil",       en: "Profile" },
  about:          { tr: "Hakkında",     en: "About" },
  experience:     { tr: "Deneyim",      en: "Experience" },
  education:      { tr: "Eğitim",       en: "Education" },
  certifications: { tr: "Sertifikalar", en: "Certifications" },
  projects:       { tr: "Projeler",     en: "Projects" },
  awards:         { tr: "Ödüller",      en: "Awards" },
  unknown:        { tr: "Bilinmiyor",   en: "Unknown" },
};

const DETECTION_PROMPT = `Bu bir LinkedIn profil ekran görüntüsü. Hangi bölüme ait olduğunu belirle.

SADECE şu JSON formatında yanıt ver (başka hiçbir şey yazma):
{"section": "profile|about|experience|education|certifications|projects|awards|unknown", "confidence": 0-100}

Bölüm tanımları:
- profile: İsim, unvan, konum, bağlantı sayısı görünüyor (üst profil bölümü)
- about: "Hakkında" veya "About" başlığı, uzun paragraf metin
- experience: "Deneyim" veya "Experience" başlığı, iş pozisyonları listesi
- education: "Eğitim" veya "Education" başlığı, okul/üniversite bilgileri
- certifications: "Lisanslar ve Sertifikalar" veya "Certifications" başlığı
- projects: "Projeler" veya "Projects" başlığı
- awards: "Onur ve Ödüller" veya "Honors & Awards" başlığı
- unknown: Yukarıdakilerden hiçbiri değil`;

export async function detectSection(
  base64: string,
  mimeType: string,
  apiKey: string
): Promise<DetectionResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  let lastError: Error = new Error("Bilinmeyen hata");

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));

      const result = await model.generateContent([
        DETECTION_PROMPT,
        { inlineData: { data: base64, mimeType } },
      ]);

      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) throw new Error("Yanıtta JSON bulunamadı");

      const parsed = JSON.parse(jsonMatch[0]);
      const section = SECTION_LABELS[parsed.section] ? parsed.section : "unknown";
      const labels = SECTION_LABELS[section];

      return {
        section,
        confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 0)),
        label_tr: labels.tr,
        label_en: labels.en,
      };
    } catch (e) {
      lastError = e as Error;
    }
  }

  throw lastError;
}
