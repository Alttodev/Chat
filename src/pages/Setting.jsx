import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Shield,
  Calendar,
  Clock,
  LogOut,
  Bookmark,
  User,
  MoonStar,
  Globe,
  Lock,
  UserRoundSearch,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toastError, toastSuccess } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { useUserDetail } from "@/hooks/authHooks";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "@/hooks/notificationHooks";
import dayjs from "dayjs";
import { formatDate, formatRelative } from "@/lib/dateHelpers";
import { useSocket } from "@/lib/socket";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { useThemeStore } from "@/lib/zustand";
import { ImageViewer } from "@/components/modals/imageViewer";
import { SunMedium } from "lucide-react";
import { markPublicAccount } from "@/api/axios";

const MOBILE_FOLLOW_SUGGESTIONS_HIDDEN_KEY = "mobile-follow-suggestions-hidden";

function SettingsComponent() {
  const { clearToken, closeEditing, user, setProfileId } = useAuthStore();
  const { disconnectSocket } = useSocket();

  const { theme, toggleTheme } = useThemeStore();

  const { data: profileData, isFetching } = useUserDetail();
  const queryClient = useQueryClient();
  const userProfile = useMemo(() => profileData, [profileData]);
  const [isPublic, setIsPublic] = useState(
    userProfile?.profile?.isPublic ?? true,
  );

  const handlePrivacyToggle = async (checked) => {
    try {
      const res = await markPublicAccount(checked);

      setIsPublic(checked);

      toastSuccess(
        res?.message ||
          (checked ? "Account is now public" : "Account is now private"),
      );
    } catch (error) {
      toastError(
        error?.response?.data?.message || "Failed to update privacy settings",
      );
    }
  };

  const memberSince =
    dayjs(userProfile?.profile?.memberSince).format("MMM YY") || "-";

  const lastUpdated = formatRelative(userProfile?.profile?.lastUpdated) || "-";

  const lastLogin = formatDate(user?.lastLogin) || "-";

  const changedPassword = user?.changedPassword
    ? formatRelative(user.changedPassword)
    : "Never changed";

  // Notification settings from API
  const { data: notificationSettingsData } = useNotificationSettings();
  const {
    mutateAsync: updateNotificationSettings,
    isPending: isUpdatingNotification,
  } = useUpdateNotificationSettings();

  const pushNotificationsEnabled =
    notificationSettingsData?.settings?.enabled ?? true;

  const recentActivity = [
    { action: "Changed password", time: changedPassword, type: "security" },

    {
      action: "Updated Personal information",
      time: lastUpdated,
      type: "profile",
    },
  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      queryClient.clear();
      localStorage.clear();
      sessionStorage.removeItem("login-at");
      sessionStorage.removeItem("welcome-post-pending");
      sessionStorage.removeItem("profile-image-reminder-shown");
      sessionStorage.removeItem(MOBILE_FOLLOW_SUGGESTIONS_HIDDEN_KEY);
      clearToken();
      closeEditing();
      setProfileId(null);
      disconnectSocket();
      window.location.href = "/";
      navigate("/");
      toastSuccess("Logout successful!");
    } catch (error) {
      toastError(error, "Failed to logout");
    }
  };

  useEffect(() => {
    setIsPublic(userProfile?.profile?.isPublic ?? true);
  }, [userProfile?.profile?.isPublic]);

  if (isFetching) {
    return (
      <div className="min-h-90 flex items-center justify-center">
        <Spinner className="text-emerald-600" size={44} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4  space-y-8 pb-20">
      {/* Header Section */}

      <div className="grid grid-cols-1  gap-8">
        {/* Activity Section */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your recent account activity and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="mt-0.5">
                      {activity.type === "security" && (
                        <Shield className="h-4 w-4 text-primary" />
                      )}
                      {activity.type === "profile" && (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-relaxed">
                        {activity.action}
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Member since
                </span>
                <Badge variant="secondary">{memberSince}</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Last login
                </span>
                <Badge variant="outline">{lastLogin}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Settings Section */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy & Notifications
            </CardTitle>
            <CardDescription>
              Control your privacy settings and notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <MoonStar className="h-4 w-4 text-slate-500" />
                  ) : (
                    <SunMedium className="h-5 w-5 text-slate-500" />
                  )}

                  <label className="!text-sm font-medium">Appearance</label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark mode
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-emerald-600"
                  aria-label="Toggle dark mode"
                />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <Globe className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-slate-500" />
                  )}

                  <label className="!text-sm font-medium">
                    {isPublic ? "Public Account" : "Private Account"}
                  </label>
                </div>

                <p className="text-sm text-muted-foreground">
                  {isPublic
                    ? "Allow everyone to view your profile and posts"
                    : "Only permitted users can view your profile and posts"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={isPublic}
                  onCheckedChange={handlePrivacyToggle}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
            </div>
            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <UserRoundSearch className="h-4 w-4 text-slate-500" />
                  <label className="text-sm font-medium">Profile Views</label>
                </div>

                <p className="text-sm text-muted-foreground">
                  See who viewed your profile with Premium
                </p>
              </div>

              {/* <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/subscription")}
                className="h-9 rounded-full text-sm font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
              >
                Premium
              </Button> */}
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/subscription")}
                className="
    relative overflow-hidden
    h-9 rounded-full
    text-sm font-medium
    text-emerald-700
    hover:bg-emerald-50 hover:text-emerald-800
    cursor-pointer

    before:absolute
    before:top-0
    before:-left-full
    before:h-full
    before:w-3/4
    before:skew-x-12
    before:bg-gradient-to-r
    before:from-transparent
    before:via-slate-300/70
    before:to-transparent
    before:animate-[shimmer_2s_linear_infinite]
  "
              >
                Premium
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-slate-500" />

                  <label className="text-sm font-medium">
                    Bookmarked Posts
                  </label>
                </div>

                <p className="text-sm text-muted-foreground">
                  View the posts you saved for later
                </p>
              </div>

              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/bookmarked-posts")}
                className="
      h-9 px-4 rounded-full
      border-emerald-200 dark:border-emerald-900/60
      bg-emerald-50 dark:bg-emerald-950/40
      text-emerald-700 dark:text-emerald-300
      hover:bg-emerald-100 dark:hover:bg-emerald-950/60
      hover:text-emerald-800 dark:hover:text-emerald-200
      transition-all duration-200
      flex items-center gap-2
      cursor-pointer
      shadow-sm
    "
              >
                <Bookmark className="h-4 w-4" />
                Saved
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <label className="!text-sm font-medium">
                    Push Notifications
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get push notifications on your devices
                </p>
              </div>
              <Switch
                className="data-[state=checked]:bg-emerald-600"
                checked={pushNotificationsEnabled}
                onCheckedChange={async (checked) => {
                  try {
                    await updateNotificationSettings({ enabled: checked });
                  } catch (error) {
                    toastError(
                      error?.response?.data?.message ||
                        "Failed to update notification settings",
                    );
                  }
                }}
                disabled={isUpdatingNotification}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <label className="!text-sm font-medium">Log out</label>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="
    bg-rose-500/10
    hover:bg-rose-500/20
    text-rose-600
    border
    border-rose-500/20
    rounded-full
    px-5
    h-10
    font-medium
    text-sm
    shadow-sm
    hover:shadow-md
    transition-all
    duration-200
    active:scale-95
    cursor-pointer
    flex
    items-center
    gap-2
  "
              >
                Log out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <ImageViewer />
    </div>
  );
}

export default SettingsComponent;
