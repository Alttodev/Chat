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
import message from "@/assets/post.png";

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
        className="w-[calc(100%-2rem)] max-w-md overflow-hidden border-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-0 shadow-2xl rounded-lg 
  
  sm:rounded-xl "
      >
        <div className="relative overflow-hidden px-6 pb-6 pt-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(52,211,153,0.18),_transparent_35%)]" />
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-4 flex h-30 w-30 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg ring-4 ring-emerald-100">
             
                <img
                  src={message}
                  alt="Cartoon welcome animation"
                  className="h-full w-full object-cover"
                 
                />
             
            </div>

            <DialogTitle className="text-2xl font-bold text-emerald-950">
              Hi {displayName}
            </DialogTitle>

            <DialogDescription className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
              Create a post and share what&apos;s on your mind today.
            </DialogDescription>

            <div className="mt-6 flex w-full flex-col  sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
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
