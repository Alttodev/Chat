import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DeleteAccountDialog({ open, onOpenChange, onConfirm }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="z-[90] w-[calc(100%-2rem)] max-w-[500px] rounded-lg p-4 sm:rounded-xl [&_button]:cursor-pointer">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account?</AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. Your profile, posts, comments,
            followers, messages, and account information will be permanently
            deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-row gap-2">
          <AlertDialogCancel className="w-1/2 mt-0 sm:w-auto">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="w-1/2 bg-red-600 hover:bg-red-700 sm:w-auto"
          >
            Delete Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
