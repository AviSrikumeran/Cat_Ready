"use client";

import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Camera, Mic, MicOff, Check, X, ChevronRight } from "lucide-react";
import { CHECKLIST_STEPS } from "@/lib/checklist";
import { cn } from "@/lib/utils";

export type PhotosByStep = Record<string, File[]>;
export type AudioByStep = (Blob | null)[];

interface InspectionCaptureProps {
  vehicleName: string;
  vehicleId: string;
  onComplete: (photosByStep: PhotosByStep, audioByStep: AudioByStep) => void;
  onBack: () => void;
}

export function InspectionCapture({ vehicleName, vehicleId, onComplete, onBack }: InspectionCaptureProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [photosByStep, setPhotosByStep] = useState<PhotosByStep>({});
  const [audioByStep, setAudioByStep] = useState<AudioByStep>(CHECKLIST_STEPS.map(() => null));
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const currentStep = CHECKLIST_STEPS[currentStepIndex];
  const currentPhotos = photosByStep[currentStep.id] || [];

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;
      const newFiles = Array.from(files);
      setPhotosByStep((prev) => ({
        ...prev,
        [currentStep.id]: [...(prev[currentStep.id] || []), ...newFiles],
      }));
      e.target.value = "";
    },
    [currentStep.id]
  );

  const handleCapturePhoto = () => fileInputRef.current?.click();

  const handleRemovePhoto = (index: number) => {
    setPhotosByStep((prev) => ({
      ...prev,
      [currentStep.id]: prev[currentStep.id]?.filter((_, i) => i !== index) || [],
    }));
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const mimeType = recorder.mimeType || "audio/webm";
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (chunksRef.current.length) {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          setAudioByStep((prev) => {
            const next = [...prev];
            next[currentStepIndex] = blob;
            return next;
          });
        }
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access failed:", err);
    }
  }, [currentStepIndex]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.requestData();
      } catch {
        // ignore if not supported
      }
      recorder.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const handleToggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const handleNext = () => {
    if (currentStepIndex < CHECKLIST_STEPS.length - 1) setCurrentStepIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex((i) => i - 1);
  };

  const handleSubmit = () => {
    onComplete(photosByStep, audioByStep);
  };

  const hasRecordedForCurrent = audioByStep[currentStepIndex] != null;
  const canSubmit = true;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        aria-label="Add photo"
      />

      <header className="sticky top-0 z-10 bg-white border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-cat-gray rounded transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{vehicleId}</p>
              <h1 className="text-lg font-bold text-cat-black">{vehicleName}</h1>
            </div>
            <div className="w-10" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 bg-cat-gray rounded overflow-hidden">
              <div
                className="h-full bg-cat-yellow transition-all"
                style={{ width: `${((currentStepIndex + 1) / CHECKLIST_STEPS.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {currentStepIndex + 1}/{CHECKLIST_STEPS.length}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        <div className="px-4 py-4 bg-cat-gray">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-2 hover:bg-white rounded disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-center flex-1 px-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Section {currentStep.sectionLabel} — {currentStep.sectionTitle}
              </p>
              <h2 className="text-xl font-black text-cat-black">{currentStep.name}</h2>
            </div>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === CHECKLIST_STEPS.length - 1}
              className="p-2 hover:bg-white rounded disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Check these items (use voice to confirm or report issues):</p>
            <ul className="space-y-1.5">
              {currentStep.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-cat-black">
                  <span className="text-cat-yellow mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Photo (only if there’s an issue — AI will assess):</p>
            <div className="grid grid-cols-3 gap-2">
              {currentPhotos.map((file, index) => (
                <div key={`${file.name}-${index}`} className="aspect-square bg-cat-gray rounded relative overflow-hidden">
                  <img src={URL.createObjectURL(file)} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-cat-red text-white rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-cat-black/70 text-white text-xs rounded">
                    Photo {index + 1}
                  </div>
                </div>
              ))}
              <button
                onClick={handleCapturePhoto}
                className="aspect-square bg-cat-gray hover:bg-cat-gray-dark border-2 border-dashed border-border rounded flex flex-col items-center justify-center transition-colors"
              >
                <Camera className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Add photo</span>
              </button>
            </div>
          </div>

          <div className="bg-cat-gray rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-cat-black">Voice note</span>
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", isRecording ? "bg-cat-red animate-pulse" : "bg-gray-300")} />
                <span className="text-xs text-muted-foreground">
                  {isRecording ? "Recording..." : hasRecordedForCurrent ? "Recorded for this step" : "Speak to confirm or report issues"}
                </span>
              </div>
            </div>
            <div className="bg-white rounded p-3 min-h-[60px] mb-3">
              <p className="text-sm text-cat-black">
                {isRecording ? (
                  <>Recording…</>
                ) : hasRecordedForCurrent ? (
                  "Voice note saved for this step. Record again to replace."
                ) : (
                  <span className="text-muted-foreground italic">Tap below to record.</span>
                )}
              </p>
            </div>
            <button
              onClick={handleToggleRecording}
              className={cn(
                "w-full py-4 rounded font-bold flex items-center justify-center gap-2 transition-all",
                isRecording ? "bg-cat-red text-white" : "bg-cat-black text-white"
              )}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5" />
                  Stop recording
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  {hasRecordedForCurrent ? "Record again" : "Start voice note"}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-border p-4">
          <div className="flex gap-3">
            <button
              onClick={handleNext}
              disabled={currentStepIndex === CHECKLIST_STEPS.length - 1}
              className="flex-1 py-4 bg-cat-gray text-cat-black font-bold rounded disabled:opacity-50"
            >
              Next step
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-4 font-bold rounded flex items-center justify-center gap-2 bg-cat-yellow text-cat-black hover:brightness-95"
            >
              <Check className="h-5 w-5" />
              Submit inspection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
