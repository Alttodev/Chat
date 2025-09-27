import { useZustandSharePopup } from "@/lib/zustand";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import PostShareForm from "../form/PostShareForm";

export function ShareDialog() {
  const { isShareOpen, closeShareModal, modalShareData } =
    useZustandSharePopup();

  return (
    <Dialog
      open={isShareOpen}
      onOpenChange={(open) => !open && closeShareModal()}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-[500px]  [&_button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="text-emerald-600 flex justify-center">
            Share Post
          </DialogTitle>
        </DialogHeader>
        <PostShareForm postId={modalShareData} />
      </DialogContent>
    </Dialog>
  );
}
