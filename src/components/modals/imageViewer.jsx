import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useImageModalStore } from "@/lib/zustand";

export function ImageViewer() {
  const { image, isOpen, close } = useImageModalStore();

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

          {image && (
            <img
              src={image}
              alt="preview"
              className="object-contain max-w-[100vw] max-h-[100vh]"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
