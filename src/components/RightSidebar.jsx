import { FollowSuggestions } from "./suggestions/FollowSuggestions";
import { UserProfileAds } from "./contact/UserProfileAds";

export function RightSidebar() {
  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-sidebar border-l border-sidebar-border overflow-y-auto no-scrollbar">
      <div className="p-4 space-y-4">
        <FollowSuggestions />
        <UserProfileAds />
      </div>
    </aside>
  );
}
