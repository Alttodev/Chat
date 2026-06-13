import {
  Bell,
  Home,
  MessageCircle,
  Play,
  Plus,
  Send,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useZustandImagePopup } from "@/lib/zustand";
import { PostImageDialog } from "./modals/postImageModal";

export function MobileMenuBar() {
  const location = useLocation();
  const { openImageModal } = useZustandImagePopup();
  const isReels = location.pathname === "/reels";
  const isMessage = location.pathname === "/messages";

  const menuItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Play, label: "Reels", path: "/reels" },
    null,
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: Send, label: "Message", path: "/messages" },
  ];

  return (
    <>
      {!isReels && !isMessage && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-background border-t border-border shadow-md">
          {/* GRID DOCK */}
          <div className="relative grid grid-cols-5 items-center  px-3">
            {menuItems.map((item, index) => {
              const isCenter = index === 2;

              if (isCenter) {
                return (
                  <div key="center" className="relative flex justify-center">
                    <Button
                      onClick={openImageModal}
                      variant="ghost"
                      className="h-13 w-13 p-0 bg-transparent hover:bg-transparent"
                    >
                      <div className="flex items-center justify-center w-8 h-8 border-2  dark:border-white rounded-md">
                        <Plus className="w-5 h-5 text-muted-foreground dark:text-white stroke-[2.5]" />
                      </div>
                    </Button>
                  </div>
                );
              }

              const isActive = location.pathname === item?.path;

              return (
                <div key={item.label} className="flex justify-center">
                  <Link to={item.path}>
                    <Button
                      variant="ghost"
                      className={`flex flex-col items-center justify-center ${
                        isActive ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                    >
                      <item.icon style={{ width: 19, height: 19 }} />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <PostImageDialog />
    </>
  );
}
