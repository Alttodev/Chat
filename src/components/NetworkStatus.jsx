import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => window.location.reload();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-4">
      <div
        role="status"
        aria-live="polite"
        className="flex w-full max-w-md items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
      >
        <WifiOff className="h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">You are offline</p>
          <p className="text-sm">Check your internet connection.</p>
        </div>
      </div>
    </div>
  );
}
