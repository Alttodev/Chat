import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useUserDetail } from "@/hooks/authHooks";
import message from "@/assets/posts.jpg";

const WELCOME_KEY = "welcome-post-pending";

export function WelcomePostDialog() {
  const { data: profileData } = useUserDetail();
  const user = useAuthStore((state) => state.user);

  const [isOpen, setIsOpen] = useState(false);
  const [welcomeData, setWelcomeData] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(WELCOME_KEY);

      if (!raw) return;

      const parsed = JSON.parse(raw);

      sessionStorage.removeItem(WELCOME_KEY);
      setWelcomeData(parsed);
      setIsOpen(true);
    } catch {
      sessionStorage.removeItem(WELCOME_KEY);
    }
  }, []);

  const displayName = useMemo(() => {
    return (
      welcomeData?.userName ||
      profileData?.profile?.userName ||
      user?.userName ||
      "there"
    );
  }, [profileData, user, welcomeData]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        hideCloseButton
        className="
          w-[calc(100%-2rem)]
          max-w-md
          overflow-hidden
          border
          border-border
          bg-card
          text-card-foreground
          p-0
          shadow-2xl
          rounded-lg
          sm:rounded-xl
        "
      >
        <div className="relative overflow-hidden px-6 pb-6 pt-8">
          <div className="relative flex flex-col items-center text-center">
            <div
              className="
                mb-4
                flex
                h-30
                w-30
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-card
                shadow-lg
                ring-4
               
                ring-emerald-200
              "
            >
              <img
                src={message}
                alt="Welcome"
                className="h-full w-full object-cover object-center scale-92"
              />
            </div>

            <DialogTitle className="text-2xl font-bold text-foreground">
              Hi {displayName}
            </DialogTitle>

            <DialogDescription className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Create a post and share what's on your mind today.
            </DialogDescription>

            <div className="mt-6 flex w-full flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
              >
                Okay, got it
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
