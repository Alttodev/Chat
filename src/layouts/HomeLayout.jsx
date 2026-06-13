import { SocialHeader } from "@/components/Header";
import { LeftSidebar } from "@/components/LeftSidebar";
import { MobileMenuBar } from "@/components/MobileMenuBar";
import { RightSidebar } from "@/components/RightSidebar";
import StatusViewer from "@/components/status/StatusViewer";
import { WelcomePostDialog } from "@/components/modals/welcomePostModal";
import { ProfileImageReminderDialog } from "@/components/modals/profileImageReminderModal";
import { ThemeModeDialog } from "@/components/modals/themeModeModal";
import { cn } from "@/lib/utils";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";

function HomeLayout() {
  const { pathname } = useLocation();

  const isReels = pathname === "/reels";
  const isMessages = pathname === "/messages";
  const isHome = pathname === "/home";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className={cn(isMessages || isReels ? "hidden md:block" : "block")}>
        <SocialHeader />
      </div>

      <StatusViewer />
      <WelcomePostDialog />
      <ProfileImageReminderDialog />
      <ThemeModeDialog />
      <MobileMenuBar />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto">
          <LeftSidebar />
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "min-w-0 flex-1  px-4 md:ml-64 md:mr-80",
            isMessages
              ? "pt-0 pb-0 py-0 mt-0 sm:pt-16"
              : isReels
                ? "px-0 sm:px-4 pt-2 pb-0 sm:pt-20"
                : isHome
                  ? "pt-16"
                  : "pt-20 sm:pt-24",
          )}
        >
          <Outlet />
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-sidebar border-l border-sidebar-border overflow-y-auto">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}

export default HomeLayout;
