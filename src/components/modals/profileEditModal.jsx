import { useProfileEdit } from "@/lib/zustand";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { PersonalInfoForm } from "../form/PersonalInfoForm";

export function ProfileEditDialog() {
  const { isOpen, closeProfile, modalData } = useProfileEdit();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeProfile()}>
      <DialogContent
        className="
    w-[calc(100%-2rem)]
    max-w-[550px]
    max-h-[98vh]
    overflow-y-auto
    rounded-3xl
    p-4
    sm:rounded-[28px]
    [&_button]:cursor-pointer

    [scrollbar-width:none]
    [-ms-overflow-style:none]
    [&::-webkit-scrollbar]:hidden
  "
      >
        <DialogHeader>
          <DialogTitle className="text-emerald-600 flex justify-center">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <PersonalInfoForm
          userProfile={modalData?.userProfile}
          isEditing={modalData?.isEditing ?? true}
          closeEditing={modalData?.closeEditing ?? closeProfile}
        />
      </DialogContent>
    </Dialog>
  );
}
