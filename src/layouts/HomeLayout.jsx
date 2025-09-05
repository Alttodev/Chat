import { SocialHeader } from "@/components/Header";
import { LeftSidebar } from "@/components/LeftSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import React from "react";
import { Outlet } from "react-router-dom";

function HomeLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SocialHeader />
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto">
          <LeftSidebar />
        </aside>

        {/* Main Content */}
        <main
          className="
            flex-1
            pt-20 pb-8
            px-4
            md:ml-64   
            md:mr-80  
          "
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
