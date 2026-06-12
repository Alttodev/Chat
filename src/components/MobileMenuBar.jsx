import { Clapperboard, Home, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export function MobileMenuBar() {
  const location = useLocation();
  const isMessages = location.pathname === "/messages";

  const menuItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Clapperboard, label: "Reels", path: "/reels" },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: MessageCircle, label: "Chat", path: "/messages" },
  ];

  return (
    <>
      {!isMessages && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-background border-t border-border shadow-sm">
          <nav className="grid grid-cols-4 gap-1 px-3 py-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.label} to={item.path}>
                  <Button
                    variant="ghost"
                    className={`flex h-10 w-full flex-col items-center justify-center gap-1 rounded-xl px-1 ${
                      isActive
                        ? "bg-emerald-600/10 text-emerald-600"
                        : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-600/10"
                    }`}
                    aria-label={item.label}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium leading-none tracking-tight">
                      {item.label}
                    </span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
