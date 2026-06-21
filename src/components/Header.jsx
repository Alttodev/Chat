import { Search, X, User, Settings, Gem, Send, Bell, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { useUserDetail } from "@/hooks/authHooks";
import { useMemo, useState, useEffect } from "react";
import { OnlineStatus } from "./onlineStatus";
import { useSearchUsers } from "@/hooks/searchHooks";
import { SearchResults } from "./SearchResults";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";
import { CommandDialog, CommandInput, CommandList } from "./ui/command";
import { useNotificationCounts } from "@/hooks/notificationHooks";

export function SocialHeader() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: profileData } = useUserDetail();
  const userProfile = useMemo(() => profileData, [profileData]);
  const { data: countsData } = useNotificationCounts();

  const totalCount = countsData?.counts?.total || 0;
  const badgeText = totalCount > 99 ? "99+" : totalCount;

  const storedData = JSON.parse(localStorage.getItem("chat-storage") || "{}");
  const userId = storedData?.state?.user?._id;

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { data: searchResults, isLoading } = useSearchUsers(debouncedQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background  ">
      <div className="flex h-full items-center justify-between gap-2 px-3 sm:px-4 max-w-full shadow-xs">
        {/* Left section - Logo + Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <img src={logo} alt="Clix Logo" className="w-8 h-8" />
            <span className=" text-xl md:text-2xl font-bold text-emerald-600">
              Clix
            </span>
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4 flex-none sm:flex-1 justify-end">
          <Search
            style={{ width: 19, height: 19 }}
            className="text-muted-foreground cursor-pointer"
            onClick={() => setSearchOpen(true)}
          />
          <div
            className="cursor-pointer"
            onClick={() => navigate("/inprogress")}
          >
            <TrendingUp
              className=" text-muted-foreground"
              style={{ width: 19, height: 19 }}
            />
          </div>

          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/notification")}
          >
            <Bell
              className=" text-muted-foreground"
              style={{ width: 19, height: 19 }}
            />

            {totalCount > 0 && (
              <span className="absolute -top-3 -right-3 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {badgeText}
              </span>
            )}
          </div>

          <div className="relative hidden sm:block">
            <Avatar className="w-8 h-8">
              <AvatarImage
                className="w-full h-full object-cover object-top"
                src={userProfile?.profile?.profileImage || "/placeholder.svg"}
              />
              <AvatarFallback className="text-emerald-600 font-semibold">
                {userProfile?.profile?.userName?.charAt(0).toUpperCase() || "-"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0">
              <OnlineStatus userId={userId} size="h-2 w-2" />
            </div>
          </div>

          <div className="relative sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative flex items-center gap-1 rounded-full focus:outline-none"
                  aria-label="Open profile menu"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      className="w-full h-full object-cover object-top"
                      src={
                        userProfile?.profile?.profileImage || "/placeholder.svg"
                      }
                    />
                    <AvatarFallback className="text-emerald-600 font-semibold">
                      {userProfile?.profile?.userName
                        ?.charAt(0)
                        .toUpperCase() || "-"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0">
                    <OnlineStatus userId={userId} size="h-2 w-2" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      className="w-full h-full object-cover object-top"
                      src={
                        userProfile?.profile?.profileImage || "/placeholder.svg"
                      }
                    />
                    <AvatarFallback className="text-emerald-600 font-semibold">
                      {userProfile?.profile?.userName
                        ?.charAt(0)
                        .toUpperCase() || "-"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {userProfile?.profile?.userName || "User"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate("/subscription")}>
                  <Gem className="w-4 h-4" />
                  Upgrade
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenuItem>

                {/* <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => navigate("/about")}>
                  <Info className="w-4 h-4" />
                  About Us
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate("/contact")}>
                  <Phone className="w-4 h-4" />
                  Contact Us
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate("/privacy-policy")}>
                  <Shield className="w-4 h-4" />
                  Privacy Policy
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate("/terms")}>
                  <FileText className="w-4 h-4" />
                  Terms
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder="Search users..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />

        <CommandList>
          <SearchResults
            data={searchResults}
            isLoading={isLoading}
            query={debouncedQuery}
            onClose={() => setSearchOpen(false)}
          />
        </CommandList>
      </CommandDialog>
    </header>
  );
}
