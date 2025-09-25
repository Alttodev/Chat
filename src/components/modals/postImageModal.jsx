import { useZustandImagePopup } from "@/lib/zustand";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { PostImageForm } from "../form/postImageForm";

export function PostImageDialog() {
  const { isImageOpen, closeImageModal } = useZustandImagePopup();

  return (
    <Dialog
      open={isImageOpen}
      onOpenChange={(open) => !open && closeImageModal()}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-[550px]  [&_button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="text-emerald-600 flex justify-center">
            Post
          </DialogTitle>
        </DialogHeader>
        <PostImageForm />
      </DialogContent>
    </Dialog>
  );
}
