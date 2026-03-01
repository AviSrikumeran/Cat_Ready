/**
 * API client for Cat Ready backend (Node.js).
 * Base URL: NEXT_PUBLIC_API_URL or http://localhost:8000/api
 */

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "") || "http://localhost:8000/api";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
}

export interface InspectionCreated {
  id: number;
  vehicle_id: string;
  started_at: string;
  completed_at: string | null;
}

export interface InspectionStepFromApi {
  step_index: number;
  step_name: string;
  result: string;
  result_reason: string;
  log: Record<string, unknown> | null;
  created_at: string;
}

export interface InspectionDetail {
  id: number;
  vehicle_id: string;
  started_at: string;
  completed_at: string | null;
  steps: InspectionStepFromApi[];
}

export async function createInspection(vehicleId: string): Promise<InspectionCreated> {
  const res = await fetch(`${getBaseUrl()}/inspections/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vehicle_id: vehicleId }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create inspection failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getInspection(id: number): Promise<InspectionDetail> {
  const res = await fetch(`${getBaseUrl()}/inspections/${id}/`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Get inspection failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function submitStep(
  inspectionId: number,
  stepIndex: number,
  stepName: string,
  audioBlob: Blob | null,
  imageFiles: File[]
): Promise<{ step_index: number; step_name: string; result: string; result_reason: string; log: unknown }> {
  const form = new FormData();
  form.append("step_index", String(stepIndex));
  form.append("step_name", stepName);
  if (audioBlob && audioBlob.size > 0) {
    form.append("audio", audioBlob, "audio.webm");
  }
  imageFiles.forEach((file, i) => {
    form.append("images", file, file.name || `image-${i}.jpg`);
  });

  const res = await fetch(`${getBaseUrl()}/inspections/${inspectionId}/steps/`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Submit step failed: ${res.status} ${text}`);
  }
  return res.json();
}

/** Map backend inspection + steps to the InspectionResult shape used by the results UI. */
export function inspectionToResult(
  inspection: InspectionDetail,
  machineId: string
): {
  machineId: string;
  timestamp: string;
  overallStatus: "pass" | "fail" | "monitor";
  confidence: number;
  categories: { name: string; status: "pass" | "fail" | "monitor"; finding: string }[];
  summary: string;
  recommendedAction: string;
} {
  const steps = inspection.steps.sort((a, b) => a.step_index - b.step_index);
  const categories = steps.map((s) => ({
    name: s.step_name || `Step ${s.step_index + 1}`,
    status: (s.result === "PASS" ? "pass" : s.result === "FAIL" ? "fail" : "monitor") as "pass" | "fail" | "monitor",
    finding: s.result_reason || s.result,
  }));
  const hasFail = steps.some((s) => s.result === "FAIL");
  const hasUnsure = steps.some((s) => s.result === "UNSURE");
  const overallStatus: "pass" | "fail" | "monitor" = hasFail ? "fail" : hasUnsure ? "monitor" : "pass";
  const passCount = steps.filter((s) => s.result === "PASS").length;
  const confidence = steps.length ? Math.round((passCount / steps.length) * 100) : 0;
  const summary = categories.map((c) => `${c.name}: ${c.status}`).join(". ") || "Inspection complete.";
  const failedReasons = steps.filter((s) => s.result === "FAIL").map((s) => s.result_reason).filter(Boolean);
  const recommendedAction =
    failedReasons.length > 0
      ? failedReasons.join(". ")
      : overallStatus === "monitor"
        ? "Review uncertain steps and re-inspect if needed."
        : "No action required. Equipment passed inspection.";

  return {
    machineId,
    timestamp: inspection.started_at,
    overallStatus,
    confidence,
    categories,
    summary,
    recommendedAction,
  };
}
