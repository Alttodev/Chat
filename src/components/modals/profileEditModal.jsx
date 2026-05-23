import { useProfileEdit } from "@/lib/zustand";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { PersonalInfoForm } from "../form/PersonalInfoForm";

export function ProfileEditDialog() {
  const { isOpen, closeProfile, modalData } = useProfileEdit();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeProfile()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[550px] rounded-lg p-4 sm:rounded-xl [&_button]:cursor-pointer">
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