import { MessageCircle, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CommentForm } from "@/components/form/CommentForm";
import { usePostCommentDelete, usePostComments } from "@/hooks/postHooks";
import { formatRelative } from "@/lib/dateHelpers";
import { toastError } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { useUserDetail } from "@/hooks/authHooks";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { renderMentionText } from "@/lib/mentionText";

export function ReelCommentsDialog({ post, open, onOpenChange }) {
  const { profileId } = useAuthStore();
  const navigate = useNavigate();
  const { data: profileData } = useUserDetail();
  const { data: activeComments, isLoading } = usePostComments(post?._id);
  const { mutateAsync: deleteComment } = usePostCommentDelete();
  const currentProfile = profileData?.profile || profileData;

  const handleDelete = async ({ postId, commentId }) => {
    try {
      await deleteComment({ postId, commentId });
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  const comments = activeComments?.comments || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "!left-0 !top-auto !bottom-0 !z-50 !max-w-none !translate-x-0 !translate-y-0 gap-0 overflow-hidden border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-black p-0 text-white shadow-[0_-20px_80px_rgba(0,0,0,0.48)]",
          "h-[88vh] w-full rounded-t-[28px] sm:!left-auto sm:!right-0 sm:!top-0 sm:!bottom-0 sm:h-full sm:!w-[440px] sm:!rounded-none sm:border-l",
        )}
      >
        <DialogTitle className="sr-only">Reel comments</DialogTitle>
        <DialogDescription className="sr-only">
          View and add comments for this reel
        </DialogDescription>

        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
                Discussion
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                Reel comments
              </h3>
            </div>
          </div>

          <div className="px-4 py-4 sm:px-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.2)] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border border-white/10">
                  <AvatarImage
                    className="h-full w-full object-cover object-top"
                    src={post?.user?.profileImage || "/placeholder.svg"}
                    alt={post?.user?.userName || "user"}
                  />
                  <AvatarFallback>
                    {post?.user?.userName?.charAt(0).toUpperCase() || "-"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-white">
                      {post?.user?.userName || "User"}
                    </span>
                   
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-white/70">
                    {post?.postText || "Share your thoughts on this reel."}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-white/60">
                <span>{typeof post?.likes === "number" ? post.likes : 0} likes</span>
                <span>{comments.length} comments</span>
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="flex-1 min-h-0 px-3 py-3 sm:px-4">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-3">
                {isLoading ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/60">
                    Loading comments...
                  </div>
                ) : comments.length ? (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      id={`comment-${comment._id}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.16)] transition-colors hover:bg-white/8"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 border border-white/10">
                          <AvatarImage
                            onClick={
                              profileId !== comment?.user?._id
                                ? () => navigate(`/users/${comment?.user?._id}`)
                                : undefined
                            }
                            className={cn(
                              "h-full w-full object-cover object-top",
                              profileId !== comment?.user?._id
                                ? "cursor-pointer"
                                : "cursor-default",
                            )}
                            src={comment?.user?.profileImage || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {comment?.user?.userName?.charAt(0).toUpperCase() || "-"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-white">
                                  {comment?.user?.userName}
                                </span>
                                <span className="text-xs text-white/45">
                                  {formatRelative(comment?.createdAt)}
                                </span>
                              </div>
                            </div>

                            {comment?.editable ? (
                              <div className="relative">
                                <button
                                  type="button"
                                  className="rounded-full p-1 text-white/45 transition hover:bg-white/10 hover:text-white"
                                  aria-label="Comment options"
                                  onClick={() =>
                                    handleDelete({
                                      postId: post?._id,
                                      commentId: comment._id,
                                    })
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ) : null}
                          </div>

                          <p
                            className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/85 break-words"
                            dangerouslySetInnerHTML={{
                              __html: renderMentionText(comment?.comment),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex min-h-[22vh] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center">
                    <div className="mb-3 rounded-full bg-emerald-400/10 p-4 text-emerald-300">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <p className="text-base font-semibold text-white">
                      Be the first to comment
                    </p>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-white/60">
                      Start the conversation with a quick reaction or a thought
                      about this reel.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="border-t border-white/10 bg-black/40 px-4  py-4 backdrop-blur-xl sm:px-5">
            <CommentForm
              userProfile={currentProfile}
              postId={post?._id}
              className="space-y-0"
              avatarClassName="h-10 w-10"
              textareaClassName="min-h-[56px] border-white/10 bg-white/5 text-white placeholder:text-white/35 caret-white focus-visible:ring-emerald-400/50"
              buttonClassName="shrink-0 bg-emerald-500 hover:bg-emerald-600"
              placeholder="Write a comment for this reel..."
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ReelCommentsDialog;
