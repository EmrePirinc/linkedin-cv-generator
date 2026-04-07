"use client";

import { useState } from "react";

interface ParsedProfile {
  full_name: string;
  headline: string;
  about: string;
  experiences: string[];
  education: string[];
  certifications: string[];
  projects: string[];
  awards: string[];
  skills: string[];
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [parsedData, setParsedData] = useState<ParsedProfile | null>(null);
  const [pdfReady, setPdfReady] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);

    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setStatus("Fotoğraflar işleniyor...");
    setParsedData(null);
    setPdfReady(false);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      setStatus("Gemini Vision ile parse ediliyor...");
      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        setStatus(`Hata: ${data.error}`);
        setLoading(false);
        return;
      }

      setParsedData(data.profile);
      setStatus("Parse tamamlandı! CV oluşturuluyor...");

      // CV oluştur
      const cvRes = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: data.profile }),
      });

      if (cvRes.ok) {
        setPdfReady(true);
        setStatus("CV hazır! İndirebilirsiniz.");
      } else {
        setStatus("CV oluşturulurken hata oluştu.");
      }
    } catch (err: any) {
      setStatus(`Hata: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">LinkedIn CV Generator</h1>
          <p className="text-gray-300">
            LinkedIn ekran görüntülerini yükle, ATS uyumlu CV otomatik oluşsun
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-10 px-6">
        {/* Yükleme Alanı */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            1. LinkedIn Ekran Görüntülerini Yükle
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Profil, Hakkında, Deneyim, Eğitim, Sertifikalar, Projeler, Ödüller bölümlerinin ekran görüntülerini yükleyin.
          </p>

          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-gray-500 transition">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="text-gray-400">
              <p className="text-lg font-semibold">Fotoğrafları buraya sürükle veya tıkla</p>
              <p className="text-sm mt-1">PNG, JPG - Birden fazla dosya seçebilirsiniz</p>
            </div>
          </label>

          {/* Önizlemeler */}
          {previews.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">
                {previews.length} fotoğraf yüklendi
              </p>
              <div className="grid grid-cols-4 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={src}
                      alt={`Screenshot ${i + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Oluştur Butonu */}
          <button
            onClick={handleSubmit}
            disabled={files.length === 0 || loading}
            className="mt-6 w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? status : "CV Oluştur"}
          </button>
        </div>

        {/* Parse Sonuçları */}
        {parsedData && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              2. Parse Edilen Veriler
            </h2>
            <div className="space-y-3 text-sm">
              <p><strong>Ad:</strong> {parsedData.full_name}</p>
              <p><strong>Başlık:</strong> {parsedData.headline}</p>
              {parsedData.about && <p><strong>Hakkında:</strong> {parsedData.about.substring(0, 200)}...</p>}
              <p><strong>Deneyim:</strong> {parsedData.experiences?.length || 0} kayıt</p>
              <p><strong>Eğitim:</strong> {parsedData.education?.length || 0} kayıt</p>
              <p><strong>Sertifika:</strong> {parsedData.certifications?.length || 0} kayıt</p>
              <p><strong>Proje:</strong> {parsedData.projects?.length || 0} kayıt</p>
              <p><strong>Yetenekler:</strong> {parsedData.skills?.join(", ")}</p>
            </div>
          </div>
        )}

        {/* İndirme */}
        {pdfReady && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              3. CV İndir
            </h2>
            <div className="flex gap-4">
              <a
                href="/api/download?lang=tr"
                className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold text-center hover:bg-gray-700 transition"
              >
                Türkçe CV İndir
              </a>
              <a
                href="/api/download?lang=en"
                className="flex-1 border-2 border-gray-900 text-gray-900 py-3 rounded-xl font-semibold text-center hover:bg-gray-50 transition"
              >
                İngilizce CV İndir
              </a>
            </div>
          </div>
        )}

        {/* Mevcut CV'ler */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold mb-2 text-gray-900">
            Mevcut CV'ler
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            En son guncellenmis CV'leri buradan indirebilirsiniz.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/cv_tr.pdf"
              download
              className="border-2 border-gray-200 rounded-xl p-5 hover:border-gray-900 transition group"
            >
              <p className="text-2xl mb-2">📄</p>
              <p className="font-semibold text-gray-900 group-hover:text-black">Turkce Genel CV</p>
              <p className="text-xs text-gray-500 mt-1">Tum deneyim ve yetenekler</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold">PDF</span>
            </a>
            <a
              href="/cv_en.pdf"
              download
              className="border-2 border-gray-200 rounded-xl p-5 hover:border-gray-900 transition group"
            >
              <p className="text-2xl mb-2">🌍</p>
              <p className="font-semibold text-gray-900 group-hover:text-black">English CV</p>
              <p className="text-xs text-gray-500 mt-1">General CV in English</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold">PDF</span>
            </a>
            <a
              href="/cv_tr_sap.pdf"
              download
              className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-600 transition group"
            >
              <p className="text-2xl mb-2">💼</p>
              <p className="font-semibold text-gray-900 group-hover:text-blue-700">SAP B1 CV</p>
              <p className="text-xs text-gray-500 mt-1">SAP Business One odakli</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-semibold">SAP</span>
            </a>
            <a
              href="/cv_tr_ai.pdf"
              download
              className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-600 transition group"
            >
              <p className="text-2xl mb-2">🤖</p>
              <p className="font-semibold text-gray-900 group-hover:text-purple-700">AI Engineer CV</p>
              <p className="text-xs text-gray-500 mt-1">Yapay Zeka Muhendisligi odakli</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-semibold">AI</span>
            </a>
          </div>
        </div>

        {/* Durum */}
        {status && !loading && (
          <p className="text-center text-sm text-gray-500 mt-6">{status}</p>
        )}
      </div>
    </main>
  );
}
