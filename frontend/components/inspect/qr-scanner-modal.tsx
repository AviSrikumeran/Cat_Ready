"use client";

import { useCallback } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { X } from "lucide-react";

interface QrScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScan: (value: string) => void;
}

export function QrScannerModal({ open, onClose, onScan }: QrScannerModalProps) {
  const handleScan = useCallback(
    (detectedCodes: { rawValue: string }[]) => {
      const first = detectedCodes[0];
      if (first?.rawValue) {
        onScan(first.rawValue);
        onClose();
      }
    },
    [onScan, onClose]
  );

  const handleError = useCallback((err: unknown) => {
    console.warn("QR scanner error:", err);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cat-black">
      {/* Header with close */}
      <div className="flex items-center justify-between p-4 bg-cat-black text-white">
        <span className="text-sm font-bold">Scan QR code</span>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close scanner"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Scanner fills the rest; needs a defined height for the video */}
      <div className="flex-1 min-h-[200px] relative w-full">
        <Scanner
          onScan={handleScan}
          onError={handleError}
          constraints={{ facingMode: "environment" }}
          formats={["qr_code"]}
          paused={false}
          allowMultiple={false}
          scanDelay={300}
          classNames={{
            container: "w-full h-full max-w-full",
            video: "w-full h-full object-cover",
          }}
        />
      </div>

      <p className="text-center text-white/80 text-sm py-3 px-4">
        Point your camera at a Cat Ready inspection QR code
      </p>
    </div>
  );
}
