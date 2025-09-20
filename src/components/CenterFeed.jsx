import { MessageCircle, Share, MoreHorizontal, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useUserDetail } from "@/hooks/authHooks";
import { useMemo } from "react";
import { PostForm } from "./form/PostForm";
import { usePostList } from "@/hooks/postHooks";
import { formatRelative } from "@/lib/dateHelpers";
import { Spinner } from "./ui/shadcn-io/spinner";
import PostLikeComponent from "./Post/PostLike";

export function CenterFeed() {
  const { data: profileData } = useUserDetail();
  const { data: postList, isFetching } = usePostList();

  const userProfile = useMemo(() => profileData, [profileData]);
  const userPost = useMemo(() => postList, [postList]);

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="text-emerald-600" size={44} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="p-4">
          <PostForm userProfile={userProfile} />
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {userPost?.posts?.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 text-emerald-600">
                  <AvatarImage src={post.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {post?.user?.userName?.charAt(0).toUpperCase() || "-"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm sm:text-base">
                    {post?.user?.userName}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {formatRelative(post?.createdAt)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-foreground mb-4 leading-relaxed text-sm sm:text-base ">
              {post?.postText}
            </p>

            {/* Post Stats */}
            <div className="mb-3 pb-3 border-b border-border" />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <PostLikeComponent post={post} userId={post?.user?._id} />
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs sm:text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Comment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs sm:text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
              >
                <Share className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
