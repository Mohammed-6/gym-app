"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, getApiErrorMessage } from "@/lib/api";

interface ViewPhotoButtonProps {
  /** e.g. `/members/${id}/photo-url` — only fetched on click, never eagerly. */
  photoUrlEndpoint: string;
  hasPhoto: boolean;
  label?: string;
}

/**
 * Shows nothing but a small button until clicked — photos are only fetched (and the signed
 * URL only generated) on demand, to keep storage/bandwidth cost down for lists of members.
 */
export function ViewPhotoButton({ photoUrlEndpoint, hasPhoto, label = "View Photo" }: ViewPhotoButtonProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setOpen(true);
    if (url) return;
    setIsLoading(true);
    try {
      const { data } = await api.get<{ data: { url: string } }>(photoUrlEndpoint);
      setUrl(data.data.url);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not load photo"));
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  }

  if (!hasPhoto) {
    return <span className="text-xs text-slate-400">No photo</span>;
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={handleClick}>
        <ImageIcon className="h-4 w-4" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogCloseButton onClick={() => setOpen(false)} />
          <DialogHeader>
            <DialogTitle>Photo</DialogTitle>
          </DialogHeader>
          <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-slate-100">
            {isLoading && <p className="text-sm text-slate-400">Loading...</p>}
            {!isLoading && url && (
              // eslint-disable-next-line @next/next/no-img-element -- signed URL from our own API, not a static asset
              <img src={url} alt="Member" className="h-full w-full object-cover" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
