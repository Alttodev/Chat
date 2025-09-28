import { useMemo, useState } from "react";
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
  Edit3,
  Calendar,
  Clock,
  LogOut,
  User,
  Mail,
  MapPin,
} from "lucide-react";
import { PersonalInfoForm } from "@/components/form/PersonalInfoForm";
import { useNavigate } from "react-router-dom";
import { toastError, toastSuccess } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { useUserDetail } from "@/hooks/authHooks";
import dayjs from "dayjs";
import { formatDate, formatRelative } from "@/lib/dateHelpers";
import { OnlineStatus } from "@/components/onlineStatus";
import { useSocket } from "@/lib/socket";

function Profile() {
  const { clearToken, isEditing, openEditing, closeEditing, user } =
    useAuthStore();
  const { disconnectSocket } = useSocket();
  const storedData = JSON.parse(localStorage.getItem("chat-storage") || "{}");
  const userId = storedData?.state?.user?._id;

  const { data: profileData } = useUserDetail();

  const userProfile = useMemo(() => profileData, [profileData]);

  const memberSince =
    dayjs(userProfile?.profile?.memberSince).format("MMM YY") || "-";

  const lastUpdated = formatRelative(userProfile?.profile?.lastUpdated) || "-";

  const lastLogin = formatDate(user?.lastLogin) || "-";

  const changedPassword = user?.changedPassword
    ? formatRelative(user.changedPassword)
    : "Never changed";

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    logout: false,
    activityStatus: true,
  });

  const recentActivity = [
    { action: "Changed password", time: changedPassword, type: "security" },

    {
      action: "Updated Personal information",
      time: lastUpdated,
      type: "profile",
    },
  ];

  const handleSave = () => {
    openEditing(false);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      clearToken();
      closeEditing();
      disconnectSocket();
      navigate("/");
      toastSuccess("Logout successful!");
    } catch (error) {
      toastError(error, "Failed to logout");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4  space-y-8">
      {/* Header Section */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl font-semibold  text-emerald-700">
                  {userProfile?.profile?.userName?.charAt(0).toUpperCase() ||
                    "-"}
                </AvatarFallback>
              </Avatar>

              <div className="absolute bottom-2 right-2">
                <OnlineStatus userId={userId} size="h-3 w-3" />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-balance">
                    {userProfile?.profile?.userName}
                  </h1>
                  <div className="flex gap-2 items-center text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{userProfile?.profile?.email}</span>
                  </div>

                  <div className="flex gap-2 items-center text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{userProfile?.profile?.address}</span>
                  </div>
                </div>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-fit cursor-pointer"
                  onClick={() => (isEditing ? handleSave() : openEditing(true))}
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1  gap-8">
        {/* Personal Information */}
        <div className="space-y-6">
          <PersonalInfoForm
            userProfile={userProfile}
            isEditing={isEditing}
            closeEditing={closeEditing}
          />
        </div>

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

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <label className="text-base font-medium">
                    Push Notifications
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get push notifications on your devices
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, pushNotifications: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <label className="text-base font-medium">Logout</label>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Profile;
