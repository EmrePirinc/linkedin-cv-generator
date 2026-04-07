import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import profile from "@/data/profile.json";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Profil verisini metin olarak hazırla (RAG context)
const profileContext = `
İsim: ${profile.name}
Başlık: ${profile.headline}
Konum: ${profile.location}
E-posta: ${profile.email}
Hakkında: ${profile.about}
Yetenekler: ${profile.skills.join(", ")}
Deneyim: ${profile.experiences.map(e => `${e.role} - ${e.title} (${e.period}): ${e.description}`).join("\n")}
Projeler: ${profile.projects.map(p => `${p.title} (${p.period}): ${p.description}`).join("\n")}
Eğitim: ${profile.education.map(e => `${e.school} - ${e.degree} (${e.period})`).join("\n")}
`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Mesaj gerekli" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(`
Sen ${profile.name}'in kişisel portfolio sitesindeki asistansın. 
Ziyaretçilerin ${profile.name} hakkında sorularını yanıtla.
Sadece aşağıdaki profil bilgilerine dayanarak cevap ver, bilmediğin şeyleri uydurmak.
Türkçe cevap ver. Kısa ve öz ol.

PROFİL BİLGİLERİ:
${profileContext}

KULLANICI SORUSU: ${message}
`);

    const response = result.response.text();

    return NextResponse.json({ reply: response });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu", details: error.message },
      { status: 500 }
    );
  }
}
