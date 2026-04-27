import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useImageModalStore } from "@/lib/zustand";

export function ImageViewer() {
  const { image, isOpen, close } = useImageModalStore();

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="p-0 border-0 bg-black/90 max-w-full w-screen h-screen flex items-center justify-center [&_button]:text-white [&_button]:hover:text-gray-200 [&_button]:h-10 [&_button]:w-10 [&_button]:sm:h-14 [&_button]:sm:w-14 [&_button]:right-2 [&_button]:sm:right-4 [&_button]:top-2 [&_button]:sm:top-4 [&_button]:fixed [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:rounded-md [&_button]:bg-transparent [&_button]:hover:bg-white/10 [&_button]:ring-0 [&_button]:focus:ring-0 [&_button]:!border-none [&_button]:outline-none [&_svg]:h-6 [&_svg]:w-6 [&_svg]:sm:h-8 [&_svg]:sm:w-8">
        <img
          src={image}
          alt="preview"
          className="max-w-full max-h-full object-contain transition-transform duration-300"
        />
      </DialogContent>
    </Dialog>
  );
}
