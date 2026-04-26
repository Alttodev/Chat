import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useImageModalStore } from "@/lib/zustand";

export function ImageViewer() {
  const { image, isOpen, close } = useImageModalStore();

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="p-0 border-0 bg-black/90 max-w-full w-screen h-screen flex items-center justify-center [&>button]:text-white [&>button]:hover:text-gray-300">
        <img
          src={image}
          alt="preview"
          className="max-w-full max-h-full object-contain transition-transform duration-300"
        />
      </DialogContent>
    </Dialog>
  );
}
