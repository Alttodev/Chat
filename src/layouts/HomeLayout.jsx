import { SocialHeader } from "@/components/Header";
import { LeftSidebar } from "@/components/LeftSidebar";
import { MobileMenuBar } from "@/components/MobileMenuBar";
import { RightSidebar } from "@/components/RightSidebar";
import StatusStrip from "@/components/status/StatusStrip";
import StatusViewer from "@/components/status/StatusViewer";
import { WelcomePostDialog } from "@/components/modals/welcomePostModal";
import { ProfileImageReminderDialog } from "@/components/modals/profileImageReminderModal";
import { ThemeModeDialog } from "@/components/modals/themeModeModal";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

function HomeLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/home";
  const isReels = pathname === "/reels";
  const isMessages = pathname === "/messages";

  const [showDesktopStatusStrip, setShowDesktopStatusStrip] = useState(true);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className={cn(isMessages || isReels ? "hidden md:block" : "block")}>
        <SocialHeader />
      </div>

      {/* Mobile status strip only on home */}
      {isHome && !isReels ? <StatusStrip className="md:hidden" /> : null}

      {/* Desktop status strip only on home */}
      {isHome && showDesktopStatusStrip ? (
        <StatusStrip
          className="hidden md:block"
          showDismissButton
          onDismiss={() => setShowDesktopStatusStrip(false)}
        />
      ) : null}

      {/* Show button only on home when strip is hidden */}
      {isHome && !showDesktopStatusStrip ? (
        <div className="hidden md:fixed md:top-17 md:left-64 md:right-80 md:z-40 md:flex md:justify-end md:px-4">
          <button
            type="button"
            onClick={() => setShowDesktopStatusStrip(true)}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-sm font-medium text-emerald-700 shadow-lg backdrop-blur-md transition hover:bg-emerald-50 dark:border-white/10 dark:bg-black/80 dark:text-white dark:hover:bg-white/10 cursor-pointer"
            aria-label="Show status section"
          >
            <Eye className="h-4 w-4" />
            Show story
          </button>
        </div>
      ) : null}

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
          className={cn("min-w-0 flex-1 px-4 md:ml-64 md:mr-80", {
            "pt-0 pb-0": isMessages,
            "px-0 sm:px-4 pt-2 pb-0 sm:pt-20": isReels,
            "pt-50 sm:pt-60 pb-8": isHome && showDesktopStatusStrip,
            "pt-50 sm:pt-28 pb-8": isHome && !showDesktopStatusStrip,
            "pt-20 sm:pt-24 pb-8": !isMessages && !isReels && !isHome,
          })}
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
