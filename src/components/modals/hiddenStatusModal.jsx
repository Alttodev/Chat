import { EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useUnhideStatusUser } from "@/hooks/statusHideHooks";
import { toastError, toastSuccess } from "@/lib/toast";
import { formatRelative } from "@/lib/dateHelpers";

export default function HiddenStatusModal({
  show,
  onClose,
  hiddenStatuses = [],
}) {
  const { mutate: unhideUser, isPending } = useUnhideStatusUser();

  const handleUnhide = async (userId) => {
    if (!userId || isPending) return;

    try {
      const res = await unhideUser(userId);
      toastSuccess(res?.data?.message || "Story unhidden");
    } catch (err) {
      toastError(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="z-[90] w-[calc(100%-2rem)] max-w-[420px] rounded-lg p-4 sm:rounded-xl [&_button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="text-emerald-600 flex items-center justify-center gap-2">
            <EyeOff className="h-4 w-4" />
            Hidden Stories
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-1 py-1">
          {hiddenStatuses.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No hidden stories
            </p>
          ) : (
            hiddenStatuses.map(({ user, status }) => {
              const fallback = user?.userName?.charAt(0)?.toUpperCase() || "S";
              const statusTime = formatRelative(status?.createdAt) || "";

              return (
                <div
                  key={user?._id}
                  className="group flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-3 transition-all hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-emerald-600">
                      <AvatarImage src={user?.profileImage} />
                      <AvatarFallback>{fallback}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {user?.userName}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {statusTime}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleUnhide(user?._id)}
                    className="flex h-9 items-center justify-center rounded-full bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                  >
                    {isPending ? "..." : "Unhide"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
