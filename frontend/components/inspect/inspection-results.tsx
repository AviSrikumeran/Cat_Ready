"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, AlertTriangle, XCircle, ArrowRight, RotateCcw, Package, QrCode, ScanLine } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Machine, InspectionResult, getStatusColor, getStatusTextColor } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { QrScannerModal } from "./qr-scanner-modal";

interface InspectionResultsProps {
  machine: Machine;
  result: InspectionResult;
  onNewInspection: () => void;
  /** Optional inspection ID from backend; encoded in QR for reference */
  inspectionId?: number;
}

export function InspectionResults({ machine, result, onNewInspection, inspectionId }: InspectionResultsProps) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedContent, setScannedContent] = useState<string | null>(null);

  const qrValue = [
    "Cat Ready Inspection",
    `Machine: ${machine.id} - ${machine.name}`,
    `Status: ${result.overallStatus.toUpperCase()}`,
    `Date: ${new Date(result.timestamp).toISOString()}`,
    result.summary,
    ...(inspectionId != null ? [`Inspection ID: ${inspectionId}`] : []),
  ].join("\n");
  const StatusIcon = result.overallStatus === "pass" 
    ? CheckCircle 
    : result.overallStatus === "fail" 
    ? XCircle 
    : AlertTriangle;

  const statusLabel = result.overallStatus.toUpperCase();
  const confidenceColor = result.confidence >= 90 
    ? "text-green-500" 
    : result.confidence >= 70 
    ? "text-cat-yellow" 
    : "text-cat-red";

  return (
    <div className="min-h-screen bg-cat-gray">
      {/* Status Header */}
      <header
        className={cn(
          "pt-8 pb-12 px-4",
          result.overallStatus === "pass" && "bg-green-500",
          result.overallStatus === "monitor" && "bg-cat-yellow",
          result.overallStatus === "fail" && "bg-cat-red"
        )}
      >
        <div className="max-w-lg mx-auto text-center">
          <StatusIcon
            className={cn(
              "h-16 w-16 mx-auto mb-4",
              result.overallStatus === "monitor" ? "text-cat-black" : "text-white"
            )}
          />
          <h1
            className={cn(
              "text-4xl font-black mb-2",
              result.overallStatus === "monitor" ? "text-cat-black" : "text-white"
            )}
          >
            {statusLabel}
          </h1>
          <p
            className={cn(
              "text-lg",
              result.overallStatus === "monitor" ? "text-cat-black/80" : "text-white/90"
            )}
          >
            {machine.name}
          </p>
          <p
            className={cn(
              "text-sm font-mono",
              result.overallStatus === "monitor" ? "text-cat-black/60" : "text-white/70"
            )}
          >
            {machine.id}
          </p>
        </div>
      </header>

      {/* Results Content */}
      <div className="px-4 -mt-6">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Confidence Card */}
          <div className="bg-white rounded p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                AI Confidence
              </span>
              <span className={cn("text-2xl font-black", confidenceColor)}>
                {result.confidence}%
              </span>
            </div>
            {result.confidence < 80 && (
              <p className="text-sm text-cat-red mt-2">
                Low confidence — consider retaking photos or adding detail.
              </p>
            )}
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">
              Summary
            </h2>
            <p className="text-cat-black leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">
              Category Breakdown
            </h2>
            <div className="space-y-3">
              {result.categories.map((category) => (
                <div
                  key={category.name}
                  className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                >
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-1 rounded uppercase shrink-0",
                      getStatusColor(category.status),
                      getStatusTextColor(category.status)
                    )}
                  >
                    {category.status}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-cat-black">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.finding}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Action */}
          <div className="bg-white rounded p-4 border-l-4 border-cat-yellow">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">
              Recommended Action
            </h2>
            <p className="text-cat-black font-medium leading-relaxed">
              {result.recommendedAction}
            </p>
          </div>

          {/* Part Identification */}
          {result.partId && (
            <div className="bg-white rounded p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cat-yellow rounded flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-cat-black" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-medium text-muted-foreground mb-1">
                    Identified Part
                  </h2>
                  <p className="font-bold text-cat-black">{result.partName}</p>
                  <p className="text-sm font-mono text-muted-foreground">
                    Part #: {result.partId}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Fitment Certainty:
                    </span>
                    <span
                      className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded uppercase",
                        result.partConfidence === "high" && "bg-green-500 text-white",
                        result.partConfidence === "medium" && "bg-cat-yellow text-cat-black",
                        result.partConfidence === "low" && "bg-cat-red text-white"
                      )}
                    >
                      {result.partConfidence}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-center py-4">
            <p className="text-xs font-mono text-muted-foreground">
              Inspection completed: {new Date(result.timestamp).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
          </div>

          {/* QR Code — share (show code) and scan (open camera) */}
          <div className="bg-white rounded p-4 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="h-5 w-5 text-cat-black" />
              <h2 className="text-sm font-medium text-muted-foreground">
                Share / Scan for summary
              </h2>
            </div>
            <div className="p-3 bg-white rounded border border-border">
              <QRCodeSVG
                value={qrValue}
                size={160}
                level="M"
                bgColor="#FFFFFF"
                fgColor="#0B0B0B"
                includeMargin={false}
              />
            </div>
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="mt-3 w-full py-3 px-4 bg-cat-yellow text-cat-black font-bold rounded flex items-center justify-center gap-2 hover:brightness-95 transition-all"
            >
              <ScanLine className="h-5 w-5" />
              Scan QR code
            </button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Scan to view machine, status, and date
            </p>
            {scannedContent && (
              <div className="mt-3 w-full p-3 bg-cat-gray rounded border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Scanned content:</p>
                <pre className="text-xs text-cat-black whitespace-pre-wrap break-words font-sans">
                  {scannedContent}
                </pre>
                <button
                  type="button"
                  onClick={() => setScannedContent(null)}
                  className="mt-2 text-xs text-cat-red font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          <QrScannerModal
            open={scannerOpen}
            onClose={() => setScannerOpen(false)}
            onScan={(value) => setScannedContent(value)}
          />

          {/* Actions */}
          <div className="pb-8 space-y-3">
            <Link
              href="/dashboard"
              className="w-full py-4 bg-cat-yellow text-cat-black font-bold rounded flex items-center justify-center gap-2"
            >
              View in Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
            <button
              onClick={onNewInspection}
              className="w-full py-4 bg-white text-cat-black font-bold rounded border border-border flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              New Inspection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
