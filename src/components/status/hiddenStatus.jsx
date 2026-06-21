import { useState } from "react";
import { EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HiddenStatusModal from "../modals/hiddenStatusModal";

export default function HiddenStatusAvatar({ hiddenStatuses = [] }) {
  const [showModal, setShowModal] = useState(false);

  if (!hiddenStatuses.length) return null;

  const previewUser = hiddenStatuses[0]?.user;
  const fallback = previewUser?.userName?.charAt(0)?.toUpperCase() || "S";

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="flex shrink-0 flex-col items-center gap-1.5"
      >
        <div className="relative">
          <Avatar className="h-14 w-14 opacity-70 ring-2 ring-white/10">
            <AvatarImage src={previewUser?.profileImage} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 ring-2 ring-black">
            <EyeOff className="h-3 w-3 text-white/80" />
          </span>
        </div>
        <p className="max-w-[64px] truncate text-center text-xs text-white/60">
          Hidden
        </p>
      </button>

      <HiddenStatusModal
        show={showModal}
        onClose={() => setShowModal(false)}
        hiddenStatuses={hiddenStatuses}
      />
    </>
  );
}
