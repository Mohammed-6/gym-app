"use client";

import { PhotoCapture } from "./photo-capture";

interface PhotoCaptureStageProps {
  uploadUrl: string;
  /** Called both when a photo finishes uploading and when the user skips. */
  onDone: () => void;
  title?: string;
}

/** Meant to be dropped in as the final stage of a create/renew flow — skippable, since a photo is never required. */
export function PhotoCaptureStage({ uploadUrl, onDone, title = "Add a Photo" }: PhotoCaptureStageProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">Optional — take a quick photo now, or skip and add one later.</p>
      </div>

      <PhotoCapture uploadUrl={uploadUrl} onUploaded={onDone} />

      <div className="text-center">
        <button type="button" onClick={onDone} className="text-sm text-slate-400 underline hover:text-slate-600">
          Skip for now
        </button>
      </div>
    </div>
  );
}
