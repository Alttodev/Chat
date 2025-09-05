import {
  Search,
  Bell,
  MessageCircle,
  Users,
  Home,
  Menu,
  User,
  LogOut,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import ClixLogo from "@/lib/logo";
import { toastError, toastSuccess } from "@/lib/toast";

export function SocialHeader() {
  const menuItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: MessageCircle, label: "Chat", path: "/messages" },
  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      navigate("/");
      toastSuccess("Logout successful!");
    } catch (error) {
      toastError(error, "Failed to logout");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 max-w-full">
        {/* Left section - Logo + Search */}
        <div className="flex items-center gap-3 flex-2 sm:flex-1">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <ClixLogo size={30} />
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
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary hover:bg-accent/10"
          >
            <Bell className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span className="relative cursor-pointer border-0 rounded-full p-1 hover:bg-slate-100 transition-colors duration-200">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-emerald-600 font-semibold">
                    JD
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-full mt-2 border-slate-200 shadow-lg"
              sideOffset={8}
            >
              <DropdownMenuLabel className="text-slate-700 font-semibold">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200" />

              <DropdownMenuItem className="group hover:bg-emerald-50 focus:bg-emerald-50 transition-colors duration-200">
                <User className="mr-1 h-4 w-4 text-slate-500 group-hover:text-emerald-600 transition-colors duration-200" />
                <span className="text-slate-700 group-hover:text-emerald-700 font-medium">
                  JD@gmail.com
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-200" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="group cursor-pointer hover:bg-red-50 focus:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="mr-1 h-4 w-4 text-slate-500 group-hover:text-red-600 transition-colors duration-200" />
                <span className="text-slate-700 group-hover:text-red-700 font-medium">
                  Logout
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                  <ClixLogo size={28} />
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
