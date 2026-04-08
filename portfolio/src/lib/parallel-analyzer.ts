import { detectSection, DetectionResult } from "./gemini-client";

export interface AnalysisResult {
  photoIndex: number;
  fileName: string;
  detection: DetectionResult | null;
  error: string | null;
  status: "success" | "failed" | "manual_required";
}

/**
 * Fotoğrafları paralel analiz eder, rate limit için batch'e ayırır.
 * 1 hata diğerlerini durdurmaz (NFR-REL-002).
 */
export async function analyzePhotos(
  photos: { base64: string; mimeType: string; fileName: string }[],
  apiKey: string,
  batchSize = 6
): Promise<AnalysisResult[]> {
  const results: AnalysisResult[] = new Array(photos.length);

  for (let i = 0; i < photos.length; i += batchSize) {
    const batch = photos.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (photo, batchIndex): Promise<AnalysisResult> => {
        const index = i + batchIndex;
        try {
          const detection = await detectSection(photo.base64, photo.mimeType, apiKey);
          return {
            photoIndex: index,
            fileName: photo.fileName,
            detection,
            error: null,
            status: detection.confidence < 60 ? "manual_required" : "success",
          };
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Analiz hatası";
          return {
            photoIndex: index,
            fileName: photo.fileName,
            detection: null,
            error: msg,
            status: "failed",
          };
        }
      })
    );

    batchResults.forEach((r, bi) => {
      results[i + bi] = r;
    });
  }

  return results;
}
