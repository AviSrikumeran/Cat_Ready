"use client";

import { useState } from "react";
import { MachineSelection } from "@/components/inspect/machine-selection";
import { InspectionCapture, type PhotosByCategory } from "@/components/inspect/inspection-capture";
import { InspectionResults } from "@/components/inspect/inspection-results";
import { machines, Machine, inspectionCategories } from "@/lib/mock-data";
import {
  createInspection,
  getInspection,
  submitStep,
  inspectionToResult,
  type InspectionDetail,
} from "@/lib/api";
import type { InspectionResult } from "@/lib/mock-data";

type Step = "select" | "capture" | "processing" | "results" | "error";

export default function InspectPage() {
  const [step, setStep] = useState<Step>("select");
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);
  const [inspectionId, setInspectionId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMachineSelect = (machine: Machine) => {
    setSelectedMachine(machine);
    setStep("capture");
  };

  const handleCaptureComplete = async (photosByCategory: PhotosByCategory, audioBlob: Blob | null) => {
    if (!selectedMachine) return;
    setStep("processing");
    setErrorMessage(null);

    try {
      const { id: inspectionId } = await createInspection(selectedMachine.id);

      for (let i = 0; i < inspectionCategories.length; i++) {
        const category = inspectionCategories[i];
        const images = photosByCategory[category.id] || [];
        const audio = i === 0 ? audioBlob : null;
        await submitStep(inspectionId, i, category.name, audio, images);
      }

      const inspection: InspectionDetail = await getInspection(inspectionId);
      const result = inspectionToResult(inspection, selectedMachine.id);
      setInspectionResult(result as InspectionResult);
      setInspectionId(inspectionId);
      setStep("results");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Submission failed.");
      setStep("error");
    }
  };

  const handleNewInspection = () => {
    setStep("select");
    setSelectedMachine(null);
    setInspectionResult(null);
    setInspectionId(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen">
      {step === "select" && (
        <MachineSelection machines={machines} onSelect={handleMachineSelect} />
      )}

      {step === "capture" && selectedMachine && (
        <InspectionCapture
          machine={selectedMachine}
          onComplete={handleCaptureComplete}
          onBack={() => setStep("select")}
        />
      )}

      {step === "processing" && <ProcessingScreen machine={selectedMachine} />}

      {step === "error" && (
        <ErrorScreen message={errorMessage || "Something went wrong."} onRetry={handleNewInspection} />
      )}

      {step === "results" && selectedMachine && inspectionResult && (
        <InspectionResults
          machine={selectedMachine}
          result={inspectionResult}
          onNewInspection={handleNewInspection}
          inspectionId={inspectionId ?? undefined}
        />
      )}
    </div>
  );
}

function ProcessingScreen({ machine }: { machine: Machine | null }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cat-gray">
      <div className="text-center">
        <div className="mb-8">
          <svg viewBox="0 0 60 52" className="w-16 h-16 mx-auto animate-pulse">
            <polygon points="30,0 60,52 0,52" fill="#FFCD11" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-cat-black mb-2">Analyzing Inspection</h2>
        <p className="text-muted-foreground mb-8">{machine?.name || "Machine"}</p>
        <div className="w-64 h-2 bg-white rounded overflow-hidden mx-auto">
          <div className="h-full w-0 bg-cat-yellow rounded animate-progress-bar" />
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cat-gray">
      <div className="max-w-md text-center">
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded font-medium">{message}</div>
        <p className="text-sm text-muted-foreground mb-6">
          Make sure the backend is running at <code className="bg-white px-1 rounded">http://localhost:8000</code> and
          CORS is enabled.
        </p>
        <button
          onClick={onRetry}
          className="py-3 px-6 bg-cat-yellow text-cat-black font-bold rounded"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
