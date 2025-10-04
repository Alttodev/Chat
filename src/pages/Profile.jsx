import {
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share,
  SquarePen,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useCommentStore,
  useZustandPopup,
  useZustandSharePopup,
} from "@/lib/zustand";
import { useEffect, useMemo, useRef } from "react";
import { usePostDelete, useUserPostList } from "@/hooks/postHooks";
import { formatRelative } from "@/lib/dateHelpers";
import { ShareDialog } from "@/components/modals/shareModal";
import PostLikeComponent from "@/components/Post/PostLike";
import { Button } from "@/components/ui/button";
import { CommentSection } from "@/components/Post/CommentSection";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { OnlineStatus } from "@/components/onlineStatus";
import { useAuthStore } from "@/store/authStore";
import { toastError, toastSuccess } from "@/lib/toast";
import { useUserDetail } from "@/hooks/authHooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostDialog } from "@/components/modals/postModal";

const Profile = () => {
  const { openModal } = useZustandPopup();
  const { profileId } = useAuthStore();
  const { openShareModal } = useZustandSharePopup();
  const { openPostId, toggleComments } = useCommentStore();
  const loadMoreRef = useRef(null);

  const storedData = JSON.parse(localStorage.getItem("chat-storage") || "{}");
  const userId = storedData?.state?.user?._id;

  const { mutateAsync: deletePost } = usePostDelete();
  const { data: profileData } = useUserDetail();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    useUserPostList({ id: profileId });

  const userProfile = useMemo(() => profileData, [profileData]);
  const posts = useMemo(
    () => data?.pages?.flatMap((page) => page.posts) || [],
    [data]
  );
  const user = data?.pages?.[0]?.user;
  const currentUser = data?.pages?.[0]?.currentUser;
  const totalPosts = data?.pages?.[0]?.totalPosts;

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleDelete = async (id) => {
    try {
      const res = await deletePost(id);
      toastSuccess(res?.message);
    } catch (err) {
      toastError(err?.response?.data?.message || "Something went wrong");
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
    <div className="w-full max-w-3xl mx-auto px-4 space-y-8">
      {/* Header */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-3">
          <div className="flex justify-between flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl font-semibold  text-emerald-700">
                  {user?.userName?.charAt(0).toUpperCase() || "-"}
                </AvatarFallback>
              </Avatar>

              <div className="absolute bottom-2 right-2">
                <OnlineStatus userId={userId} size="h-3 w-3" />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-xl font-bold text-balance">
                    {user?.userName}
                  </div>

                  <div className="flex gap-2 items-center text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex gap-2 items-center text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{user?.address}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-semibold text-black">
                      {totalPosts}
                    </span>
                    <span className="text-sm text-muted-foreground">Posts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {posts.map((post) => (
        <Card key={post._id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 text-emerald-600">
                  <AvatarImage src={post.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {user?.userName?.charAt(0).toUpperCase() || "-"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm sm:text-base">
                    {user?.userName}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {formatRelative(post?.createdAt)}
                  </p>
                </div>
              </div>
              {post?.isOwner && (
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
                        openModal({ userProfile, postId: post._id })
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
                      <Trash2 className="mr-1 h-4 w-4 text-slate-500 transition-colors duration-200" />
                      <span className="text-red-500 font-medium">
                        Delete Post
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-foreground mb-4 leading-relaxed text-sm sm:text-base">
              {post?.postText}
            </p>
            {post?.image && (
              <img
                className="w-full h-auto object-cover rounded-lg"
                src={`${import.meta.env.VITE_APP_API_URL}${post.image}`}
                alt="post"
              />
            )}

            <div className="mb-3 pb-3 border-b border-border" />

            <div className="flex items-center justify-between">
              <PostLikeComponent post={post} userId={post?.user?._id} />
              <div className="flex-1 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComments(post?._id)}
                  className=" text-xs sm:text-sm text-muted-foreground hover:bg-transparent cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 mr-1" /> Comment
                </Button>
              </div>
              <div className="flex-1 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openShareModal(post?._id)}
                  className="text-xs sm:text-sm text-muted-foreground hover:bg-transparent  cursor-pointer"
                >
                  <Share className="w-4 h-4 mr-1" /> Share
                </Button>
              </div>
            </div>

            {openPostId === post._id && (
              <div className="border-t border-border mt-3">
                <CommentSection postId={post._id} userProfile={currentUser} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      <ShareDialog />
      <PostDialog />
      <div ref={loadMoreRef} style={{ height: "20px" }} />
      {isFetchingNextPage && <PostSkeleton />}
      {!hasNextPage && (
        <div className="flex justify-center">
          <span className="px-3 text-sm text-muted-foreground">
            No more posts
          </span>
        </div>
      )}
    </div>
  );
};

export default Profile;
