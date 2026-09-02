"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

interface QrCodeProps {
  /** The full URL (or any text) to encode. */
  url: string;
  size?: number;
  className?: string;
  /** File name for the downloaded PNG, without extension. Defaults to "qr-code". */
  downloadName?: string;
}

/** Renders a QR code for the given URL on a canvas. Purely client-side — no network call. */
export function QrCode({ url, size = 200, className, downloadName = "qr-code" }: QrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;
    setError(null);

    QRCode.toCanvas(canvasRef.current, url, { width: size, margin: 1 }, (err) => {
      if (err) setError("Could not generate QR code");
    });
  }, [url, size]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${downloadName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  if (!url) return null;

  return (
    <div className={cn("group relative inline-block", className)}>
      <canvas ref={canvasRef} width={size} height={size} className="block" />

      {!error && (
        <button
          type="button"
          onClick={handleDownload}
          aria-label="Download QR code"
          title="Download QR code"
          className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-md bg-slate-900/80 text-white opacity-0 transition-opacity hover:bg-slate-900 group-hover:opacity-100"
        >
          <Download className="h-4 w-4" />
        </button>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
