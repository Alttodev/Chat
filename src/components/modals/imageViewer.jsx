import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useImageModalStore } from "@/lib/zustand";
import { isVideoMediaUrl } from "@/lib/media";
import { Volume2, VolumeX } from "lucide-react";

export function ImageViewer() {
  const { image, isOpen, close } = useImageModalStore();
  const isVideo = isVideoMediaUrl(image || "");
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    setIsMuted(true);
  }, [image]);

  return (
    <Dialog
      open={isOpen && !!image}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="p-0 border-0 max-w-none w-screen h-screen">
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
          <button
            onClick={close}
            className="absolute top-9 right-4 z-50 text-white bg-black/50 rounded-full px-3 py-1"
          >
            ✕
          </button>

          {image &&
            (isVideo ? (
              <>
                <video
                  src={image}
                  controls
                  autoPlay
                  playsInline
                  muted={isMuted}
                  className="object-contain max-w-[100vw] max-h-[100vh]"
                />

                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="absolute right-4 top-20 z-50 rounded-full bg-black/60 p-3 text-white backdrop-blur-sm transition hover:bg-black/80"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
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
                src={image}
                alt="preview"
                className="object-contain max-w-[100vw] max-h-[100vh]"
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
