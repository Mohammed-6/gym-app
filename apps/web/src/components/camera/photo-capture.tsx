"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api, getApiErrorMessage } from "@/lib/api";

interface PhotoCaptureProps {
  /** Where the captured photo is POSTed as multipart/form-data (field name "photo"). */
  uploadUrl: string;
  onUploaded: () => void;
  className?: string;
}

type Stage = "live" | "preview";

/**
 * Reusable camera capture + confirm + upload widget. Renders inline — embed it directly in a
 * page or wrap it in a Dialog yourself; it doesn't assume where it's used.
 */
export function PhotoCapture({ uploadUrl, onUploaded, className }: PhotoCaptureProps) {
  const [stage, setStage] = useState<Stage>("live");
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        if (!cancelled) setCameraError("Camera not available — you can upload a photo file instead.");
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function setCaptured(blob: Blob) {
    setCapturedBlob(blob);
    setPreviewUrl(URL.createObjectURL(blob));
    setStage("preview");
  }

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    canvas.toBlob((blob) => blob && setCaptured(blob), "image/jpeg", 0.92);
  }

  function handleFileChosen(file: File) {
    setCaptured(file);
  }

  function handleRetake() {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setCapturedBlob(null);
    setStage("live");
  }

  async function handleConfirm() {
    if (!capturedBlob) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", capturedBlob, "photo.jpg");
      await api.post(uploadUrl, formData);
      toast.success("Photo saved");
      onUploaded();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not upload photo"));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={className}>
      <canvas ref={canvasRef} className="hidden" />

      {stage === "live" && (
        <div className="space-y-3">
          <div className="mx-auto flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden rounded-lg bg-slate-900">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          </div>

          {cameraError && <p className="text-center text-xs text-amber-600">{cameraError}</p>}

          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={handleCapture} disabled={Boolean(cameraError)}>
              <Camera className="h-4 w-4" />
              Capture
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50">
              <Upload className="h-4 w-4" />
              Upload File
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleFileChosen(file);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
      )}

      {stage === "preview" && previewUrl && (
        <div className="space-y-3">
          <div className="mx-auto flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden rounded-lg bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote image */}
            <img src={previewUrl} alt="Captured preview" className="h-full w-full object-cover" />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" variant="outline" onClick={handleRetake} disabled={isUploading}>
              <RotateCcw className="h-4 w-4" />
              Retake
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Confirm & Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
