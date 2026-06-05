import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EyeIcon, BadgeCheck, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfileViewSeen } from "@/hooks/profileViewHooks";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { formatRelative } from "@/lib/dateHelpers";
import { cn } from "@/lib/utils";

const getDisplayName = (user) =>
  user?.userName || user?.name || user?.fullName || user?.email || "User";

const getAvatarSrc = (user) =>
  user?.profileImage || user?.avatar || user?.image || "/placeholder.svg";

const getUserId = (user) => user?._id || user?.id || user?.userId;

function ProfileViewsCard() {
  const navigate = useNavigate();
  const { data: profileData, isLoading } = useProfileViewSeen();

  const viewers = profileData?.viewers || [];
  const totalViews = profileData?.count ?? viewers.length;


  return (
    <div className="space-y-8">
      {/* Profile Views List Card */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-500/10 dark:to-background">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="
    group
    cursor-pointer
    text-foreground
    hover:bg-transparent
    hover:text-foreground
  "
              >
                <ArrowLeft
                  className="
      h-4 w-4
      transition-transform
      duration-300
      group-hover:-translate-x-1
    "
                />
              </Button>

              <div>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  Profile Viewers
                </CardTitle>

                <p className="text-sm text-muted-foreground mt-1">
                  {totalViews === 1
                    ? "1 person viewed your profile"
                    : `${totalViews} people viewed your profile`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-white shadow-sm">
              <EyeIcon className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold">{totalViews}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="text-emerald-600" size={44} />
            </div>
          ) : viewers.length > 0 ? (
            <>
              <div className="divide-y">
                {viewers.map((item, index) => {
                  const viewer = item.viewer;
                  const userId = getUserId(viewer) || `${index}`;
                  const displayName = getDisplayName(viewer);
                  const avatarSrc = getAvatarSrc(viewer);
                  const viewerId = getUserId(viewer);

                  return (
                    <button
                      key={userId}
                      type="button"
                      onClick={() => {
                        if (viewerId) {
                          navigate(`/users/${viewerId}`);
                        }
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                        viewerId ? "cursor-pointer" : "cursor-default",
                      )}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          className="h-full w-full object-cover object-top"
                          src={avatarSrc}
                          alt={displayName}
                        />

                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 truncate font-medium text-foreground">
                          {displayName}
                          {item?.viewer?.isVerified && (
                            <BadgeCheck className="h-4 w-4 fill-blue-500 text-white flex-shrink-0" />
                          )}
                        </div>

                        <div className="truncate text-sm text-muted-foreground">
                          {item?.viewedAt
                            ? `Viewed ${formatRelative(item.viewedAt)}`
                            : "Tap to view profile"}
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <EyeIcon className="h-6 w-6" />
              </div>

              <div>
                <p className="text-base font-semibold">No views yet</p>

                <p className="text-sm text-muted-foreground">
                  When people view your profile, they will appear here.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileViewsCard;
