import { Home, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export function MobileMenuBar() {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: MessageCircle, label: "Chat", path: "/messages" },
  ];

  return (
    <div className="fixed top-46 left-0 right-0 z-40 sm:hidden bg-background border-b border-border shadow-sm">
      <nav className="grid grid-cols-3 gap-1 px-3 py-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.label} to={item.path}>
              <Button
                variant="ghost"
                className={`w-full justify-center gap-2 h-11 rounded-xl ${
                  isActive
                    ? "bg-emerald-600/10 text-emerald-600"
                    : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-600/10"
                }`}
                aria-label={item.label}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

