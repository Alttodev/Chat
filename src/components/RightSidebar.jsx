import { useUserProfiles } from "@/hooks/authHooks";
import { UserProfiles } from "./contact/UserProfiles";
import { useMemo } from "react";
import { ContactSkeleton } from "./skeleton/contactSkeleton";
import { UserProfileAds } from "./contact/UserProfileAds";

export function RightSidebar() {
  const { data: profile, isLoading } = useUserProfiles();
  const data = useMemo(() => profile, [profile]);

  if (isLoading) {
    return <ContactSkeleton />;
  }

  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-sidebar border-l border-sidebar-border overflow-y-auto">
      <div className="p-4 space-y-4">
        <UserProfiles data={data} />
        <UserProfileAds />
      </div>
    </aside>
  );
}
