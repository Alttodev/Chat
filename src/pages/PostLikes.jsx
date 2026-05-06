import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { usePostInfo, usePostLikedUsers } from "@/hooks/postHooks";
import { formatRelative } from "@/lib/dateHelpers";
import { cn } from "@/lib/utils";

const getDisplayName = (user) =>
  user?.userName || user?.name || user?.fullName || user?.email || "User";

const getAvatarSrc = (user) =>
  user?.profileImage || user?.avatar || user?.image || "/placeholder.svg";

const getUserId = (user) => user?._id || user?.id || user?.userId;

function PostLikes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: postData, isLoading: isPostLoading } = usePostInfo(id);
  const { data: likedUsersData, isLoading: isLikesLoading } =
    usePostLikedUsers(id);

  const post = postData?.post;
  const likers = likedUsersData?.likedUsers || [];
  const totalLikes =
    typeof likedUsersData?.totalLikes === "number"
      ? likedUsersData.totalLikes
      : post?.likes || 0;
  const isLoading = isPostLoading || isLikesLoading;

  const hasLikerList = likers.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-90 flex items-center justify-center">
        <Spinner className="text-emerald-600" size={44} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-full hover:bg-emerald-100 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-lg">Liked by</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {totalLikes === 1
                    ? "1 person likes this"
                    : `${totalLikes} people like this`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-white shadow-sm">
              <Heart className="h-4 w-4 fill-white text-white" />
              <span className="text-sm font-semibold">{totalLikes}</span>
            </div>
          </div>
        </CardHeader>

        {post && (
          <CardContent className="border-b bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-11 w-11 text-emerald-600">
                <AvatarImage
                  className="h-full w-full object-cover object-top"
                  src={post?.user?.profileImage || "/placeholder.svg"}
                  alt={post?.user?.userName}
                />
                <AvatarFallback>
                  {post?.user?.userName?.charAt(0).toUpperCase() || "-"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="font-semibold text-foreground">
                  {post?.user?.userName || "Post"}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {post?.postText}
                </p>
              </div>
            </div>
          </CardContent>
        )}

        <CardContent className="p-0">
          {hasLikerList ? (
            <div className="divide-y">
              {likers.map((user, index) => {
                const userId = getUserId(user) || `${index}`;
                const displayName = getDisplayName(user);
                const avatarSrc = getAvatarSrc(user);
                const profileId = getUserId(user);

                return (
                  <button
                    key={userId}
                    type="button"
                    onClick={() => {
                      if (profileId) {
                        navigate(`/users/${profileId}`);
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                      profileId ? "cursor-pointer" : "cursor-default",
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
                      <div className="truncate font-medium text-foreground">
                        {displayName}
                      </div>
                      <div className="truncate text-sm text-muted-foreground">
                        {user?.likedAt
                          ? `Liked ${formatRelative(user.likedAt)}`
                          : "Tap to view profile"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-semibold">
                  {totalLikes > 0 ? "Like list unavailable" : "No likes yet"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {totalLikes > 0
                    ? "The post has likes, but the API is not returning the liker list yet."
                    : "When people like this post, they will appear here."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PostLikes;
