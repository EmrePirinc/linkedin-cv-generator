import sectionsConfig from "./sections.config.json";
import { AnalysisResult } from "./parallel-analyzer";

export interface SectionCheckResult {
  missingRequired: { id: string; label_tr: string; label_en: string }[];
  missingOptional: { id: string; label_tr: string; label_en: string }[];
  detected: string[];
  canProceed: boolean;
}

/**
 * Tespit edilen bölümleri config ile karşılaştırır.
 * Zorunlu bölüm eksikse canProceed = false (FR-004).
 * İsteğe bağlı bölüm eksikse sadece bilgi verir (FR-005).
 * Bölüm listesi config'den okunur, hardcode değil (NFR-MAINT-001).
 */
export function checkSections(results: AnalysisResult[]): SectionCheckResult {
  const detectedSet = new Set(
    results
      .filter((r) => r.status === "success" && r.detection)
      .map((r) => r.detection!.section)
  );

  const missingRequired = sectionsConfig.sections
    .filter((s) => s.required && !detectedSet.has(s.id))
    .map((s) => ({ id: s.id, label_tr: s.label_tr, label_en: s.label_en }));

  const missingOptional = sectionsConfig.sections
    .filter((s) => !s.required && !detectedSet.has(s.id))
    .map((s) => ({ id: s.id, label_tr: s.label_tr, label_en: s.label_en }));

  return {
    missingRequired,
    missingOptional,
    detected: [...detectedSet],
    canProceed: missingRequired.length === 0,
  };
}

/**
 * Manuel düzeltme sonrası bölüm tespiti sonuçlarını günceller.
 */
export function applyManualCorrections(
  results: AnalysisResult[],
  corrections: Record<number, string>
): AnalysisResult[] {
  return results.map((r) => {
    if (corrections[r.photoIndex] !== undefined) {
      const sectionId = corrections[r.photoIndex];
      const sectionDef = sectionsConfig.sections.find((s) => s.id === sectionId);
      return {
        ...r,
        detection: {
          section: sectionId,
          confidence: 100,
          label_tr: sectionDef?.label_tr ?? sectionId,
          label_en: sectionDef?.label_en ?? sectionId,
        },
        status: "success" as const,
        error: null,
      };
    }
    return r;
  });
}
