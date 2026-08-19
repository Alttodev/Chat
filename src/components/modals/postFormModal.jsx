import { useZustandFormPopup } from "@/lib/zustand";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { PostForm } from "../form/PostForm";

export function PostFormDialog() {
  const { isFormOpen, closeFormModal } = useZustandFormPopup();

  return (
    <Dialog
      open={isFormOpen}
      onOpenChange={(open) => !open && closeFormModal()}
    >
      <DialogContent
        className="
         fixed
    top-20
    left-1/2
    -translate-x-1/2
    translate-y-0
  w-[calc(100%-2rem)] 
  max-w-[550px] 
  rounded-3xl 
  p-4
  overflow-visible
  sm:rounded-[28px]
  [&_button]:cursor-pointer
"
      >
        <DialogTitle className="text-emerald-600 flex justify-center">
          Add Post
        </DialogTitle>
        <PostForm />
      </DialogContent>
    </Dialog>
  );
}
