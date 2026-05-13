import ReelsFeed from "@/components/reels/ReelsFeed";
import InProgress from "./InProgress";

export default function Reels() {
  return (
    <div className="min-h-[calc(100vh-8rem)] pb-20 sm:pb-6">
      {/* <ReelsFeed /> */}
      <InProgress/>
    </div>
  );
}
