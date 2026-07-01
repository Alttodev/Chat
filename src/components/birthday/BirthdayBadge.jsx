import { Cake } from "lucide-react";
import { useState } from "react";

import { toastError } from "@/lib/toast";
import { useClaimBirthdayReward } from "@/hooks/profileViewHooks";

export function BirthdayBadge({ onClaimed }) {
  const { mutateAsync: claimReward, isPending } = useClaimBirthdayReward();
  const [claiming, setClaiming] = useState(false);

  const handleClick = async () => {
    if (isPending || claiming) return;
    setClaiming(true);
    try {
      const res = await claimReward();
      onClaimed?.(res?.reward);
    } catch (error) {
      toastError(error?.response?.data?.message || "Couldn't claim reward");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || claiming}
      className="relative flex items-center justify-center w-8 h-8 rounded-full cursor-pointer bg-gradient-to-br from-pink-400 to-amber-300 shadow-sm animate-bounce disabled:opacity-60 disabled:animate-none"
      aria-label="Claim your birthday reward"
      title="It's your birthday! Tap to claim your reward 🎉"
    >
      <Cake className="w-4 h-4 text-white" />
    </button>
  );
}
