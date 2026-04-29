import { SocialHeader } from "@/components/Header";
import { LeftSidebar } from "@/components/LeftSidebar";
import { MobileMenuBar } from "@/components/MobileMenuBar";
import { RightSidebar } from "@/components/RightSidebar";
import StatusStrip from "@/components/status/StatusStrip";
import StatusViewer from "@/components/status/StatusViewer";
import { cn } from "@/lib/utils";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";

function HomeLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/home";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SocialHeader />
      <StatusStrip className="md:hidden" />
      {pathname === "/home" ? <StatusStrip className="hidden md:block" /> : null}
      <StatusViewer />
      <MobileMenuBar />
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto ">
          <LeftSidebar />
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 pb-8 px-4 md:ml-64 md:mr-80",
            isHome ? "pt-65 sm:pt-60" : "pt-65 sm:pt-20",
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
