import {
  MessageCircle,
  Share,
  MoreHorizontal,
  Trash2,
  SquarePen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserDetail } from "@/hooks/authHooks";
import { useMemo } from "react";
import { PostForm } from "./form/PostForm";
import { usePostDelete, usePostList } from "@/hooks/postHooks";
import { formatRelative } from "@/lib/dateHelpers";
import { Spinner } from "./ui/shadcn-io/spinner";
import PostLikeComponent from "./Post/PostLike";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toastError, toastSuccess } from "@/lib/toast";
import { PostDialog } from "./modals/postModal";
import {
  useCommentStore,
  useZustandPopup,
  useZustandSharePopup,
} from "@/lib/zustand";
import { CommentSection } from "./Post/CommentSection";
import { PostImageDialog } from "./modals/postImageModal";
import { ShareDialog } from "./modals/shareModal";

export function CenterFeed() {
  const { openModal } = useZustandPopup();
  const { openShareModal } = useZustandSharePopup();
  const { openPostId, toggleComments } = useCommentStore();
  const { data: profileData } = useUserDetail();
  const { data: postList, isFetching } = usePostList();
  const { mutateAsync: deletePost } = usePostDelete();

  const userProfile = useMemo(() => profileData, [profileData]);
  const userPost = useMemo(() => postList, [postList]);

  const handleDelete = async (id) => {
    try {
      const res = await deletePost(id);
      toastSuccess(res?.message);
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-90 flex items-center justify-center">
        <Spinner className="text-emerald-600" size={44} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="p-3">
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
              {post?.isOwner ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <span className="relative cursor-pointer border-0 rounded-full p-1 hover:bg-slate-100 transition-colors duration-200">
                      <MoreHorizontal className="w-4 h-4" />
                      <span className="sr-only">Toggle user menu</span>
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-full mt-1 border-slate-200 shadow-lg"
                    sideOffset={8}
                  >
                    <DropdownMenuItem
                      className="cursor-pointer transition-colors duration-200"
                      onClick={() =>
                        openModal({
                          userProfile: userProfile,
                          postId: post._id,
                        })
                      }
                    >
                      <SquarePen className="mr-1 h-4 w-4 text-slate-500 group-hover:text-emerald-600 transition-colors duration-200" />
                      <span className="text-emerald-700 font-medium">
                        Edit Post
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer transition-colors duration-200 mt-1"
                      onClick={() => handleDelete(post._id)}
                    >
                      <Trash2 className="mr-1 h-4 w-4 text-slate-500  transition-colors duration-200" />
                      <span className="text-red-500 font-medium">
                        Delete Post
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-foreground mb-4 leading-relaxed text-sm sm:text-base ">
              {post?.postText}
            </p>
            {post?.image && (
              <img
                className="w-full h-auto object-cover rounded-lg "
                src={`${import.meta.env.VITE_APP_API_URL}${post.image}`}
                alt="post"
              />
            )}

            {/* Post Stats */}
            <div className="mb-3 pb-3 border-b border-border" />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <PostLikeComponent post={post} userId={post?.user?._id} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleComments(post._id)}
                className="flex-1 text-xs sm:text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Comment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openShareModal(post._id)}
                className="flex-1 text-xs sm:text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
              >
                <Share className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
            {openPostId === post._id && (
              <div className="border-t border-border mt-3">
                <CommentSection postId={post._id} userProfile={userProfile} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      <PostDialog />
      <PostImageDialog />
      <ShareDialog />
    </div>
  );
}
