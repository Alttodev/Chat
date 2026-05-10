import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useEffect, useMemo, useState } from "react";
import { useUserDetail } from "@/hooks/authHooks";
import { useNavigate } from "react-router-dom";
import reminderImage from "@/assets/profile.jpg";

const LOGIN_AT_KEY = "login-at";
const REMINDER_SHOWN_KEY = "profile-image-reminder-shown";
const REMINDER_DELAY_MS = 2 * 60 * 1000;

export function ProfileImageReminderDialog() {
  const navigate = useNavigate();
  const { data: profileData } = useUserDetail();
  const [isOpen, setIsOpen] = useState(false);

  const profileImage = profileData?.profile?.profileImage;
  const hasProfileImage = !!profileImage;

  const displayName = useMemo(
    () => profileData?.profile?.userName || "there",
    [profileData],
  );

  useEffect(() => {
    if (hasProfileImage) return undefined;

    const alreadyShown = sessionStorage.getItem(REMINDER_SHOWN_KEY) === "1";
    const loginAtRaw = sessionStorage.getItem(LOGIN_AT_KEY);
    const loginAt = loginAtRaw ? Number(loginAtRaw) : null;

    if (alreadyShown || !loginAt || Number.isNaN(loginAt)) return undefined;

    const elapsed = Date.now() - loginAt;

    if (elapsed >= REMINDER_DELAY_MS) {
      setIsOpen(true);
      sessionStorage.setItem(REMINDER_SHOWN_KEY, "1");
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem(REMINDER_SHOWN_KEY, "1");
    }, REMINDER_DELAY_MS - elapsed);

    return () => window.clearTimeout(timer);
  }, [hasProfileImage]);

  const handleOpenSettings = () => {
    setIsOpen(false);
    navigate("/settings");
  };

  const handleClose = (open) => {
    setIsOpen(open);
    if (!open) {
      sessionStorage.setItem(REMINDER_SHOWN_KEY, "1");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md overflow-hidden border-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-0 shadow-2xl rounded-lg 
  
  sm:rounded-xl"
      >
        <div className="relative overflow-hidden px-6 pb-6 pt-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(52,211,153,0.18),_transparent_35%)]" />
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg ring-4 ring-emerald-100">
              <img
                src={reminderImage}
                alt="Profile reminder illustration"
                className="h-full w-full object-cover"
              />
            </div>

            <DialogTitle className="text-2xl font-bold text-emerald-950">
              Hi {displayName}
            </DialogTitle>

            <DialogDescription className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
              Upload your profile image
            </DialogDescription>

            <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={handleOpenSettings}
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Upload Image
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
