import { useZustandPopup } from "@/lib/zustand";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { PostUpdateForm } from "../form/postUpdateForm";

export function PostDialog() {
  const { isOpen, closeModal, modalData } = useZustandPopup();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[600px]  [&_button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="text-emerald-600 flex justify-center">
            Edit Post
          </DialogTitle>
        </DialogHeader>
        < PostUpdateForm userProfile={modalData?.userProfile} />
      </DialogContent>
    </Dialog>
  );
}
