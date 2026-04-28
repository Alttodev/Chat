import { Search, X, User, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { useUserDetail } from "@/hooks/authHooks";
import { useMemo, useState, useEffect } from "react";
import { OnlineStatus } from "./onlineStatus";
import NotificationSection from "./notification/NotificationSection";
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

export function SocialHeader() {
  const navigate = useNavigate();
  const { data: profileData } = useUserDetail();
  const userProfile = useMemo(() => profileData, [profileData]);

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
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background border-b border-border shadow-sm">
      <div className="flex h-full items-center justify-between gap-2 px-3 sm:px-4 max-w-full">
        {/* Left section - Logo + Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <img src={logo} alt="Clix Logo" className="w-8 h-8" />
            <span className="hidden sm:block text-xl md:text-2xl font-bold text-emerald-600">
              Clix
            </span>
          </Link>
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0 w-full max-w-none sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-muted border-0 focus:bg-background text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <SearchResults
              data={searchResults}
              isLoading={isLoading}
              query={debouncedQuery}
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 flex-none sm:flex-1 justify-end">
          <NotificationSection />
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
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
