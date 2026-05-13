import ReelsFeed from "@/components/reels/ReelsFeed";
import { ShareDialog } from "@/components/modals/shareModal";


export default function Reels() {
  return (
    <div className="min-h-[calc(100vh-8rem)] pb-2 sm:pb-6">
      <ReelsFeed />
      <ShareDialog />
    </div>
  );
}
