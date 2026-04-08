"use client";

import { useState } from "react";
import sectionsConfig from "@/lib/sections.config.json";

type Step = "upload" | "detecting" | "review" | "generating" | "done";

interface DetectionResult {
  section: string;
  confidence: number;
  label_tr: string;
  label_en: string;
}

interface AnalysisResult {
  photoIndex: number;
  fileName: string;
  detection: DetectionResult | null;
  error: string | null;
  status: "success" | "failed" | "manual_required";
}

interface SectionCheckResult {
  missingRequired: { id: string; label_tr: string }[];
  missingOptional: { id: string; label_tr: string }[];
  detected: string[];
  canProceed: boolean;
}

interface Profile {
  full_name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  linkedin_url: string;
  github_url: string;
  about: string;
  skills: string[];
  experiences: { company: string; title: string; start_date: string; end_date: string; description: string }[];
  education: { school: string; degree: string; field_of_study: string; start_date: string; end_date: string }[];
  certifications: { name: string; authority: string; date: string }[];
  projects: { title: string; start_date: string; end_date: string; description: string }[];
  awards: { title: string; issuer: string; date: string; description: string }[];
  languages: { name: string; level: string }[];
}

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Sonuçlar
  const [detections, setDetections] = useState<AnalysisResult[]>([]);
  const [sectionCheck, setSectionCheck] = useState<SectionCheckResult | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [manualCorrections, setManualCorrections] = useState<Record<number, string>>({});

  // Düzenleme
  const [editProfile, setEditProfile] = useState<Profile | null>(null);

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;

    setStep("detecting");
    setStatus("Bölümler tespit ediliyor...");
    setError("");

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    if (Object.keys(manualCorrections).length > 0) {
      formData.append("manualLabels", JSON.stringify(manualCorrections));
    }

    try {
      setStatus("Gemini Vision ile analiz ediliyor...");
      const res = await fetch("/api/parse", { method: "POST", body: formData });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setStep("upload");
        return;
      }

      setDetections(data.detections || []);
      setSectionCheck(data.sectionCheck);

      if (data.profile) {
        setProfile(data.profile);
        setEditProfile(JSON.parse(JSON.stringify(data.profile)));
      }

      setStep("review");
      setStatus("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu");
      setStep("upload");
    }
  };

  const handleGenerateCV = async () => {
    if (!editProfile) return;

    setStep("generating");
    setStatus("CV oluşturuluyor...");

    try {
      const res = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: editProfile }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setStep("review");
        return;
      }

      setStep("done");
      setStatus("CV hazır!");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "CV üretim hatası");
      setStep("review");
    }
  };

  const sectionOptions = sectionsConfig.sections.map((s) => ({
    value: s.id,
    label: s.label_tr,
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white py-10 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">LinkedIn CV Generator</h1>
          <p className="text-gray-300 text-sm">
            LinkedIn ekran görüntülerini yükle, ATS uyumlu CV otomatik oluşsun
          </p>
          {/* Adım göstergesi */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs">
            {[
              { key: "upload", label: "1. Yükle" },
              { key: "review", label: "2. İncele" },
              { key: "done", label: "3. İndir" },
            ].map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-500">→</span>}
                <span
                  className={
                    step === s.key
                      ? "bg-white text-gray-900 px-2 py-0.5 rounded font-semibold"
                      : step === "done" || (step === "review" && i < 2) || (step === "generating" && i < 2)
                      ? "text-gray-300"
                      : "text-gray-500"
                  }
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-8 px-6 space-y-6">
        {/* ADIM 1: YÜKLEME */}
        {(step === "upload" || step === "detecting") && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Checklist */}
            <h2 className="text-lg font-bold mb-3 text-gray-900">
              Hangi ekran görüntülerini almalısınız?
            </h2>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {sectionsConfig.sections.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-2 text-sm p-2 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <span className="text-base mt-0.5">{s.icon}</span>
                  <div>
                    <span className="font-medium text-gray-800">{s.label_tr}</span>
                    {s.required ? (
                      <span className="ml-1 text-xs text-red-500 font-semibold">*zorunlu</span>
                    ) : (
                      <span className="ml-1 text-xs text-gray-400">isteğe bağlı</span>
                    )}
                    <p className="text-gray-400 text-xs mt-0.5 leading-tight">{s.hint}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload alanı */}
            <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-500 transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-gray-500 font-semibold">Fotoğrafları buraya sürükle veya tıkla</p>
              <p className="text-gray-400 text-sm mt-1">PNG, JPG — birden fazla seçebilirsiniz</p>
            </label>

            {/* Önizlemeler */}
            {previews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">{previews.length} fotoğraf seçildi</p>
                <div className="grid grid-cols-5 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={src}
                        alt={`${i + 1}`}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={files.length === 0 || step === "detecting"}
              className="mt-5 w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {step === "detecting" ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span> {status}
                </span>
              ) : (
                "CV Oluştur"
              )}
            </button>
          </div>
        )}

        {/* ADIM 2: İNCELEME */}
        {step === "review" && editProfile && (
          <>
            {/* Tespit Sonuçları */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-900">Tespit Edilen Bölümler</h2>

              {sectionCheck && !sectionCheck.canProceed && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <strong>Zorunlu bölümler eksik:</strong>{" "}
                  {sectionCheck.missingRequired.map((s) => s.label_tr).join(", ")}
                  <p className="mt-1 text-xs">Bu bölümlerin ekran görüntülerini ekleyip tekrar deneyin.</p>
                </div>
              )}

              {sectionCheck && sectionCheck.missingOptional.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                  <strong>Atlanacak bölümler:</strong>{" "}
                  {sectionCheck.missingOptional.map((s) => s.label_tr).join(", ")} — CV'ye dahil edilmeyecek.
                </div>
              )}

              <div className="space-y-2">
                {detections.map((d) => (
                  <div key={d.photoIndex} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400 w-5 text-right">{d.photoIndex + 1}.</span>
                    <span className="text-gray-600 flex-1 truncate">{d.fileName}</span>
                    {d.status === "failed" ? (
                      <span className="text-red-500 text-xs">✗ {d.error}</span>
                    ) : d.status === "manual_required" ? (
                      <select
                        className="text-xs border rounded px-2 py-1 text-gray-700"
                        value={manualCorrections[d.photoIndex] || d.detection?.section || ""}
                        onChange={(e) => {
                          setManualCorrections((prev) => ({
                            ...prev,
                            [d.photoIndex]: e.target.value,
                          }));
                        }}
                      >
                        <option value="">Bölüm seçin</option>
                        {sectionOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="text-green-600 font-medium">
                          {d.detection?.label_tr}
                        </span>
                        <span className="text-xs text-gray-400">%{d.detection?.confidence}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {!sectionCheck?.canProceed && (
                <button
                  onClick={() => { setStep("upload"); setError(""); }}
                  className="mt-4 w-full border-2 border-gray-900 text-gray-900 py-2 rounded-xl font-semibold hover:bg-gray-50 transition text-sm"
                >
                  ← Fotoğraf Ekle
                </button>
              )}
            </div>

            {/* Veri Onay Formu */}
            {sectionCheck?.canProceed && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4 text-gray-900">Verileri Kontrol Et</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Parse edilen bilgileri inceleyin, gerekirse düzeltin, ardından onaylayın.
                </p>

                <div className="space-y-4">
                  {/* Kişisel Bilgiler */}
                  <fieldset className="border border-gray-100 rounded-xl p-4">
                    <legend className="text-xs font-semibold text-gray-500 uppercase px-1">
                      Kişisel Bilgiler
                    </legend>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <label className="text-xs text-gray-500">Ad Soyad</label>
                        <input
                          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                          value={editProfile.full_name}
                          onChange={(e) =>
                            setEditProfile({ ...editProfile, full_name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Başlık</label>
                        <input
                          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                          value={editProfile.headline}
                          onChange={(e) =>
                            setEditProfile({ ...editProfile, headline: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">E-posta</label>
                        <input
                          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                          value={editProfile.email || ""}
                          onChange={(e) =>
                            setEditProfile({ ...editProfile, email: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Telefon</label>
                        <input
                          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                          value={editProfile.phone || ""}
                          onChange={(e) =>
                            setEditProfile({ ...editProfile, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* Hakkında */}
                  <fieldset className="border border-gray-100 rounded-xl p-4">
                    <legend className="text-xs font-semibold text-gray-500 uppercase px-1">
                      Hakkında
                    </legend>
                    <textarea
                      className="w-full mt-2 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
                      rows={4}
                      value={editProfile.about || ""}
                      onChange={(e) =>
                        setEditProfile({ ...editProfile, about: e.target.value })
                      }
                    />
                  </fieldset>

                  {/* Deneyim */}
                  {editProfile.experiences?.length > 0 && (
                    <fieldset className="border border-gray-100 rounded-xl p-4">
                      <legend className="text-xs font-semibold text-gray-500 uppercase px-1">
                        Deneyim ({editProfile.experiences.length})
                      </legend>
                      <div className="mt-2 space-y-2">
                        {editProfile.experiences.map((exp, i) => (
                          <div key={i} className="text-sm bg-gray-50 rounded-lg p-3">
                            <p className="font-medium text-gray-800">{exp.title}</p>
                            <p className="text-gray-500">{exp.company} · {exp.start_date} – {exp.end_date}</p>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {/* Eğitim */}
                  {editProfile.education?.length > 0 && (
                    <fieldset className="border border-gray-100 rounded-xl p-4">
                      <legend className="text-xs font-semibold text-gray-500 uppercase px-1">
                        Eğitim ({editProfile.education.length})
                      </legend>
                      <div className="mt-2 space-y-2">
                        {editProfile.education.map((edu, i) => (
                          <div key={i} className="text-sm bg-gray-50 rounded-lg p-3">
                            <p className="font-medium text-gray-800">{edu.school}</p>
                            <p className="text-gray-500">{edu.degree} · {edu.field_of_study}</p>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {/* Yetenekler */}
                  {editProfile.skills?.length > 0 && (
                    <fieldset className="border border-gray-100 rounded-xl p-4">
                      <legend className="text-xs font-semibold text-gray-500 uppercase px-1">
                        Yetenekler ({editProfile.skills.length})
                      </legend>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {editProfile.skills.map((s, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {/* Sertifikalar */}
                  {editProfile.certifications?.length > 0 && (
                    <fieldset className="border border-gray-100 rounded-xl p-4">
                      <legend className="text-xs font-semibold text-gray-500 uppercase px-1">
                        Sertifikalar ({editProfile.certifications.length})
                      </legend>
                      <div className="mt-2 space-y-1">
                        {editProfile.certifications.map((c, i) => (
                          <p key={i} className="text-sm text-gray-700">
                            {c.name} — <span className="text-gray-500">{c.authority} ({c.date})</span>
                          </p>
                        ))}
                      </div>
                    </fieldset>
                  )}
                </div>

                {error && (
                  <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
                )}

                <button
                  onClick={handleGenerateCV}
                  className="mt-6 w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition"
                >
                  Onayla ve CV Oluştur
                </button>
              </div>
            )}
          </>
        )}

        {/* ADIM 2.5: ÜRETİLİYOR */}
        {step === "generating" && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-4xl animate-spin inline-block mb-4">⟳</div>
            <p className="text-gray-700 font-semibold">CV oluşturuluyor...</p>
            <p className="text-gray-400 text-sm mt-1">LaTeX derleniyor, yaklaşık 15-30 saniye</p>
          </div>
        )}

        {/* ADIM 3: İNDİR */}
        {step === "done" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <span className="text-4xl">✅</span>
              <h2 className="text-xl font-bold mt-2 text-gray-900">CV Hazır!</h2>
              <p className="text-gray-500 text-sm mt-1">
                LinkedIn profilinizden ATS uyumlu CV oluşturuldu.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            <button
              onClick={() => {
                setStep("upload");
                setFiles([]);
                setPreviews([]);
                setDetections([]);
                setSectionCheck(null);
                setProfile(null);
                setEditProfile(null);
                setError("");
                setManualCorrections({});
              }}
              className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600 transition"
            >
              Yeni CV oluştur
            </button>
          </div>
        )}

        {/* MEVCUT CV'LER */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-base font-bold mb-1 text-gray-900">Mevcut CV&apos;ler</h2>
          <p className="text-xs text-gray-500 mb-4">En son güncellenmiş CV&apos;leri buradan indirebilirsiniz.</p>
          <div className="grid grid-cols-2 gap-3">
            <a href="/cv_tr.pdf" download className="border-2 border-gray-200 rounded-xl p-4 hover:border-gray-900 transition group">
              <p className="text-xl mb-1">📄</p>
              <p className="font-semibold text-sm text-gray-900">Türkçe Genel CV</p>
              <p className="text-xs text-gray-400 mt-0.5">Tüm deneyim ve yetenekler</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-semibold">PDF</span>
            </a>
            <a href="/cv_en.pdf" download className="border-2 border-gray-200 rounded-xl p-4 hover:border-gray-900 transition group">
              <p className="text-xl mb-1">🌍</p>
              <p className="font-semibold text-sm text-gray-900">English CV</p>
              <p className="text-xs text-gray-400 mt-0.5">General CV in English</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-semibold">PDF</span>
            </a>
            <a href="/cv_tr_sap.pdf" download className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-600 transition group">
              <p className="text-xl mb-1">💼</p>
              <p className="font-semibold text-sm text-gray-900">SAP B1 CV</p>
              <p className="text-xs text-gray-400 mt-0.5">SAP Business One odaklı</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-semibold">SAP</span>
            </a>
            <a href="/cv_tr_ai.pdf" download className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-600 transition group">
              <p className="text-xl mb-1">🤖</p>
              <p className="font-semibold text-sm text-gray-900">AI Engineer CV</p>
              <p className="text-xs text-gray-400 mt-0.5">Yapay Zeka Mühendisliği odaklı</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-semibold">AI</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
