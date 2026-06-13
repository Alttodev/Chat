import { useZustandImagePopup } from "@/lib/zustand";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { PostImageForm } from "../form/postImageForm";

export function PostImageDialog() {
  const { isImageOpen, closeImageModal } = useZustandImagePopup();

  return (
    <Dialog
      open={isImageOpen}
      onOpenChange={(open) => !open && closeImageModal()}
    >
      <DialogContent
        className="
  w-[calc(100%-2rem)] 
  max-w-[550px] 
  rounded-lg 
  p-4
  overflow-visible
  sm:rounded-xl
  [&_button]:cursor-pointer
"
      >
        <DialogTitle className="text-emerald-600 flex justify-center">
          Add Post
        </DialogTitle>
        <PostImageForm />
      </DialogContent>
    </Dialog>
  );
}
