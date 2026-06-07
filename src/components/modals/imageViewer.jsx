import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useImageModalStore } from "@/lib/zustand";
import { isVideoMediaUrl } from "@/lib/media";
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";

export function ImageViewer() {
  const { media, currentIndex, isOpen, close, next, prev } =
    useImageModalStore();

  const currentMedia = media?.[currentIndex];

  const isVideo = isVideoMediaUrl(currentMedia || "");

  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    setIsMuted(true);
  }, [currentMedia]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        className="
    p-0
    border-0
    max-w-screen
    w-screen
    h-screen
    rounded-none
    [&>button]:hidden
  "
      >
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-8 right-4 z-50 bg-black/60 text-white px-3 py-1 rounded-full"
          >
            ✕
          </button>

          {/* Counter */}
          {media.length > 1 && (
            <div className="absolute top-8 left-4 z-50 bg-black/60 text-white px-3 py-1 rounded-full">
              {currentIndex + 1}/{media.length}
            </div>
          )}

          {/* Previous */}
          {media.length > 1 && currentIndex > 0 && (
            <button
              onClick={prev}
              className="absolute left-4 z-50 bg-black/60 text-white p-3 rounded-full"
            >
              <ChevronLeft />
            </button>
          )}

          {/* Next */}
          {media.length > 1 && currentIndex < media.length - 1 && (
            <button
              onClick={next}
              className="absolute right-4 z-50 bg-black/60 text-white p-3 rounded-full"
            >
              <ChevronRight />
            </button>
          )}

          {isVideo ? (
            <>
              <video
                src={currentMedia}
                controls
                autoPlay
                muted={isMuted}
                className="max-w-[100vw] max-h-[100vh] object-contain"
              />

              <button
                onClick={() => setIsMuted((p) => !p)}
                className="absolute top-20 right-4 z-50 bg-black/60 p-3 rounded-full text-white"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
            </>
          ) : (
            <img
              src={currentMedia}
              alt="preview"
              className="max-w-[100vw] max-h-[100vh] object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
