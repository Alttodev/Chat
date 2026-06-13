import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isVideoMediaUrl } from "@/lib/media";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export function StatusDraftModal({
  open,
  onOpenChange,
  file,
  onPost,
  isUploading = false,
}) {
  const [caption, setCaption] = useState("");

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  const isVideo = file
    ? isVideoMediaUrl(file?.name || "") || file?.type === "video/mp4"
    : false;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!open) setCaption("");
  }, [open]);

  if (!file) return null;

  const handlePost = () => {
    onPost?.(caption.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
  w-[calc(100%-2rem)] 
  max-w-[550px] 
  rounded-lg 
  p-4
  sm:rounded-xl
  [&_button]:cursor-pointer
"
      >
        <DialogHeader className=" px-4 py-4 sm:px-6">
          <DialogTitle className="text-emerald-600 flex justify-center">
            Add Story
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(92vh-72px)] overflow-y-auto p-4 sm:max-h-[calc(88vh-72px)] sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="w-full shrink-0 md:w-1/2">
              <div className="flex h-[35vh] w-full items-center justify-center overflow-hidden rounded-2xl  sm:h-[50vh] md:h-[60vh]">
                {isVideo ? (
                  <video
                    src={previewUrl}
                    controls
                    playsInline
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Selected status preview"
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Caption
              </label>

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                rows={4}
                className="min-h-[50px] w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  onClick={handlePost}
                  disabled={isUploading}
                  className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>Post Story</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
