import { Home, MessageCircle, Play, Plus, Users } from "lucide-react";
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
    { icon: MessageCircle, label: "Chat", path: "/messages" },
  ];

  return (
    <>
      {!isReels && !isMessage && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-background border-t border-border shadow-md">
          {/* GRID DOCK */}
          <div className="relative grid grid-cols-5 items-center py-1 px-3">
            {menuItems.map((item, index) => {
              const isCenter = index === 2;

              if (isCenter) {
                return (
                  <div key="center" className="relative flex justify-center">
                   
                      <Button
                        onClick={openImageModal}
                        className="h-12 w-12 rounded-full bg-emerald-600 shadow-lg flex items-center justify-center"
                      >
                        <Plus className="w-6 h-6 text-white" />
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
                      <item.icon className="w-5 h-5" />
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
