import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useUserDetail } from "@/hooks/authHooks";

const LOGIN_AT_KEY = "login-at";
const THEME_PROMPT_KEY = "theme-mode-reminder-shown";
const THEME_PROMPT_DELAY_MS = 60 * 1000;

export function ThemeModeDialog() {
  const navigate = useNavigate();
  const { data: profileData } = useUserDetail();
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem(THEME_PROMPT_KEY) === "1";
    if (alreadyShown) return undefined;

    const loginAtRaw = sessionStorage.getItem(LOGIN_AT_KEY);
    const loginAt = loginAtRaw ? Number(loginAtRaw) : null;

    if (loginAt && !Number.isNaN(loginAt)) {
      const elapsed = Date.now() - loginAt;

      if (elapsed >= THEME_PROMPT_DELAY_MS) {
        setIsOpen(true);
        localStorage.setItem(THEME_PROMPT_KEY, "1");
        return undefined;
      }

      const timer = window.setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(THEME_PROMPT_KEY, "1");
      }, THEME_PROMPT_DELAY_MS - elapsed);

      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem(THEME_PROMPT_KEY, "1");
    }, THEME_PROMPT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  const handleClose = (open) => {
    setIsOpen(open);
    if (!open) {
      localStorage.setItem(THEME_PROMPT_KEY, "1");
    }
  };

  const displayName =
    profileData?.profile?.userName || user?.userName || "there";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md overflow-hidden border-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-0 shadow-2xl rounded-lg sm:rounded-xl">
        <div className="relative overflow-hidden px-6 pb-6 pt-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(52,211,153,0.18),_transparent_35%)]" />
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-4 flex h-30 w-30 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg ring-4 ring-emerald-100">
              <div className="flex h-full w-full items-center justify-center bg-white">
                <SunMedium className="h-12 w-12 text-amber-500" />
                <MoonStar className="ml-[-0.5rem] h-10 w-10 text-slate-400" />
              </div>
            </div>

            <DialogTitle className="text-2xl font-bold text-emerald-950">
              Hi {displayName}
            </DialogTitle>

            <DialogDescription className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
              Theme controls are in Settings now. Open Settings to switch
              between light and dark mode.
            </DialogDescription>

            <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={() => {
                  navigate("/settings");
                  handleClose(false);
                }}
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Go to Settings
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
