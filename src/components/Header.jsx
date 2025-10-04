import { Search, MessageCircle, Users, Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { useUserDetail } from "@/hooks/authHooks";
import { useMemo } from "react";
import { OnlineStatus } from "./onlineStatus";
import NotificationSection from "./notification/NotificationSection";

export function SocialHeader() {
  const { data: profileData } = useUserDetail();
  const userProfile = useMemo(() => profileData, [profileData]);

  const storedData = JSON.parse(localStorage.getItem("chat-storage") || "{}");
  const userId = storedData?.state?.user?._id;

  const menuItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: MessageCircle, label: "Chat", path: "/messages" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 max-w-full">
        {/* Left section - Logo + Search */}
        <div className="flex items-center gap-3 flex-2 sm:flex-1">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <img
              src="/src/assets/logo.png"
              alt="Clix Logo"
              className="w-10 h-10"
            />
            <span className="hidden sm:block text-xl md:text-2xl font-bold text-emerald-600">
              Clix
            </span>
          </Link>
          {/* Search Bar */}
          <div className="relative flex-1 max-w-[200px] sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-muted border-0 focus:bg-background text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Center section */}
        <div className="hidden sm:flex items-center gap-2">
          {menuItems.map((item) => (
            <Link key={item.label} to={item.path}>
              <Button
                variant="ghost"
                size="lg"
                className="text-muted-foreground hover:text-primary hover:bg-accent/10 cursor-pointer"
              >
                <item.icon className="w-6 h-6" />
              </Button>
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <NotificationSection />
          <div className="relative">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-emerald-600 font-semibold">
                {userProfile?.profile?.userName?.charAt(0).toUpperCase() || "-"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0">
              <OnlineStatus userId={userId} size="h-2 w-2" />
            </div>
          </div>
          {/* Mobile Menu Drawer */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden text-muted-foreground hover:text-primary hover:bg-accent/10"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img
                    src="/src/assets/logo.png"
                    alt="Clix Logo"
                    className="w-10 h-10"
                  />
                  <span className="text-lg font-bold text-emerald-600">
                    Clix
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* Navigation inside drawer */}
              <nav className="mt-6 space-y-2">
                {menuItems.map((item) => (
                  <Link key={item.label} to={item.path}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
