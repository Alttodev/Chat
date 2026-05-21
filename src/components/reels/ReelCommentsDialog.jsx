import {
  CornerDownRight,
  MessageCircle,
  MessageSquareText,
  MoreHorizontal,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
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
import {
  usePostCommentDelete,
  usePostCommentReaction,
  usePostComments,
} from "@/hooks/postHooks";
import { formatRelative } from "@/lib/dateHelpers";
import { toastError } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { useUserDetail } from "@/hooks/authHooks";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { renderMentionText } from "@/lib/mentionText";
import { useThemeStore } from "@/lib/zustand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export function ReelCommentsDialog({ post, open, onOpenChange }) {
  const { profileId } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const navigate = useNavigate();
  const { data: profileData } = useUserDetail();
  const { data: activeComments, isLoading } = usePostComments(post?._id);
  const { mutateAsync: deleteComment } = usePostCommentDelete();
  const { mutateAsync: reactToComment } = usePostCommentReaction();
  const currentProfile = profileData?.profile || profileData;
  const [replyToComment, setReplyToComment] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const isDark = theme === "dark";

  useEffect(() => {
    setReplyToComment(null);
    setExpandedReplies({});
  }, [open, post?._id]);

  const handleDelete = async ({ postId, commentId }) => {
    try {
      await deleteComment({ postId, commentId });
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleReaction = async ({ commentId, type }) => {
    try {
      await reactToComment({ postId: post?._id, commentId, type });
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: prev[commentId] === false,
    }));
  };

  const comments = activeComments?.comments || [];

  const renderCommentNode = (comment, level = 0) => {
    const threadedReplies = comment?.replies || [];
    const isNested = level > 0;
    const isReplyingToThisComment = replyToComment?.commentId === comment._id;
    const areRepliesOpen = expandedReplies[comment._id] !== false;
    const hasReplies = threadedReplies.length > 0;
    const likeCount = comment?.likeCount || 0;
    const dislikeCount = comment?.dislikeCount || 0;

    return (
      <div
        key={comment._id}
        id={`comment-${comment._id}`}
        className={cn("scroll-mt-24", isNested ? "pl-4 sm:pl-6" : "")}
      >
        <div
          className={cn(
            "flex gap-2 transition-colors",
            isNested
              ? cn(
                  "relative pl-2.5 pt-1.5",
                  isDark
                    ? "border-l border-white/10"
                    : "border-l border-slate-200",
                )
              : cn(
                  "rounded-2xl border p-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
                  isDark
                    ? "border-white/10 bg-white/5 hover:bg-white/8"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100/80",
                ),
            isNested ? "bg-transparent" : "",
          )}
        >
          {isNested ? (
            <CornerDownRight
              className={cn(
                "absolute -left-2.5 top-2.5 h-3.5 w-3.5",
                isDark ? "text-white/35" : "text-slate-400",
              )}
            />
          ) : null}

          <Avatar
            className={cn(
              "border",
              isDark ? "border-white/10" : "border-slate-200",
              isNested ? "h-7 w-7" : "h-9 w-9",
            )}
          >
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
                  <span
                    className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-slate-900",
                    )}
                  >
                    {comment?.user?.userName}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      isDark ? "text-white/45" : "text-slate-500",
                    )}
                  >
                    {formatRelative(comment?.createdAt)}
                  </span>
                </div>
              </div>

              {comment?.editable ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "rounded-full p-1 transition cursor-pointer",
                        isDark
                          ? "text-white/45 hover:bg-white/10 hover:text-white"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                      )}
                      aria-label="Comment options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className={cn(
                      "shadow-lg",
                      isDark
                        ? "border-white/10 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-900",
                    )}
                    sideOffset={8}
                  >
                    <DropdownMenuItem
                      className="cursor-pointer transition-colors duration-200"
                      onClick={() =>
                        handleDelete({
                          postId: post?._id,
                          commentId: comment._id,
                        })
                      }
                    >
                      <Trash2
                        className={cn(
                          "mr-2 h-4 w-4",
                          isDark ? "text-white/60" : "text-slate-500",
                        )}
                      />
                      <span className="text-red-400 font-medium">Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>

            <p
              className={cn(
                "mt-2 whitespace-pre-wrap break-words text-sm leading-6",
                isDark ? "text-white/85" : "text-slate-700",
              )}
              dangerouslySetInnerHTML={{
                __html: renderMentionText(comment?.comment),
              }}
            />

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-colors cursor-pointer",
                )}
                onClick={() =>
                  handleReaction({ commentId: comment._id, type: "like" })
                }
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{likeCount}</span>
              </button>

              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-colors cursor-pointer",
                )}
                onClick={() =>
                  handleReaction({ commentId: comment._id, type: "dislike" })
                }
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                <span>{dislikeCount}</span>
              </button>

              {hasReplies ? (
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer",
                  )}
                  onClick={() => toggleReplies(comment._id)}
                >
                  <MessageSquareText className="h-3.5 w-3.5" />
                  <span>{threadedReplies.length}</span>
                </button>
              ) : null}

              {profileId !== comment?.user?._id ? (
                <>
                  <button
                    type="button"
                    className={cn(
                      "text-xs font-medium transition-colors cursor-pointer",
                      isDark
                        ? "text-white/60 hover:text-white"
                        : "text-slate-500 hover:text-slate-900",
                    )}
                    onClick={() =>
                      setReplyToComment({
                        commentId: comment._id,
                        userName: comment?.user?.userName,
                      })
                    }
                  >
                    Reply
                  </button>

                  {isReplyingToThisComment ? (
                    <button
                      type="button"
                      className={cn(
                        "text-xs font-medium transition-colors cursor-pointer",
                        isDark
                          ? "text-white/60 hover:text-white"
                          : "text-slate-500 hover:text-slate-900",
                      )}
                      onClick={() => setReplyToComment(null)}
                    >
                      Cancel
                    </button>
                  ) : null}
                </>
              ) : null}
            </div>

            {isReplyingToThisComment ? (
              <div className="mt-3">
                <CommentForm
                  userProfile={currentProfile}
                  postId={post?._id}
                  parentCommentId={comment._id}
                  replyToUserName={comment?.user?.userName}
                  className="w-full"
                  avatarClassName="h-7 w-7"
                  textareaClassName={cn(
                    "min-h-[48px] text-sm",
                    isDark
                      ? "border-white/10 bg-white/5 text-white placeholder:text-white/35 caret-white focus-visible:ring-emerald-400/50"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 caret-slate-900 focus-visible:ring-emerald-500/40",
                  )}
                  buttonClassName="h-10 w-10 shrink-0 bg-emerald-500 hover:bg-emerald-600"
                  placeholder={`Reply to ${comment?.user?.userName || "comment"}...`}
                  onSuccess={() => setReplyToComment(null)}
                />
              </div>
            ) : null}
          </div>
        </div>

        {hasReplies && areRepliesOpen ? (
          <div className="mt-1.5 space-y-1.5">
            {threadedReplies.map((reply) =>
              renderCommentNode(reply, level + 1),
            )}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "!left-0 !top-auto !bottom-0 !z-50 !max-w-none !translate-x-0 !translate-y-0 gap-0 overflow-hidden p-0 shadow-[0_-20px_80px_rgba(0,0,0,0.48)]",
          isDark
            ? "border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white"
            : "border-slate-200 bg-white text-slate-900",
          "h-[88vh] max-h-[88vh] w-full rounded-t-[28px] sm:!left-auto sm:!right-0 sm:!top-0 sm:!bottom-0 sm:h-full sm:max-h-full sm:!w-[440px] sm:!rounded-none sm:border-l",
        )}
      >
        <DialogTitle className="sr-only">Reel comments</DialogTitle>
        <DialogDescription className="sr-only">
          View and add comments for this reel
        </DialogDescription>

        <div className="flex h-full min-h-0 flex-col">
          <div
            className={cn(
              "flex items-center justify-between border-b px-4 py-4 sm:px-5",
              isDark ? "border-white/10" : "border-slate-200",
            )}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-500">
                Discussion
              </p>
              <h3
                className={cn(
                  "mt-1 text-lg font-semibold",
                  isDark ? "text-white" : "text-slate-900",
                )}
              >
                Reel comments
              </h3>
            </div>
          </div>

          <div className="px-4 py-4 sm:px-5">
            <div
              className={cn(
                "rounded-2xl border p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-md",
                isDark
                  ? "border-white/10 bg-white/5"
                  : "border-slate-200 bg-slate-50",
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar
                  className={cn(
                    "h-11 w-11",
                    isDark
                      ? "border border-white/10"
                      : "border border-slate-200",
                  )}
                >
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
                    <span
                      className={cn(
                        "truncate font-semibold",
                        isDark ? "text-white" : "text-slate-900",
                      )}
                    >
                      {post?.user?.userName || "User"}
                    </span>
                  </div>

                  <p
                    className={cn(
                      "mt-1 line-clamp-2 text-sm leading-6",
                      isDark ? "text-white/70" : "text-slate-600",
                    )}
                  >
                    {post?.postText || "Share your thoughts on this reel."}
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  "mt-4 flex items-center gap-4 text-xs",
                  isDark ? "text-white/60" : "text-slate-500",
                )}
              >
                <span>
                  {typeof post?.likes === "number" ? post.likes : 0} likes
                </span>
                <span>{comments.length} comments</span>
              </div>
            </div>
          </div>

          <Separator className={isDark ? "bg-white/10" : "bg-slate-200"} />

          <div className="flex-1 min-h-0 overflow-hidden px-3 py-3 sm:px-4">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-3">
                {isLoading ? (
                  <div
                    className={cn(
                      "rounded-2xl border px-4 py-8 text-center text-sm",
                      isDark
                        ? "border-white/10 bg-white/5 text-white/60"
                        : "border-slate-200 bg-slate-50 text-slate-500",
                    )}
                  >
                    Loading comments...
                  </div>
                ) : comments.length ? (
                  comments.map((comment) => renderCommentNode(comment))
                ) : (
                  <div
                    className={cn(
                      "flex min-h-[22vh] flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-10 text-center",
                      isDark
                        ? "border-white/10 bg-white/5"
                        : "border-slate-200 bg-slate-50",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-3 rounded-full p-4",
                        isDark
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-emerald-50 text-emerald-600",
                      )}
                    >
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <p
                      className={cn(
                        "text-base font-semibold",
                        isDark ? "text-white" : "text-slate-900",
                      )}
                    >
                      Be the first to comment
                    </p>
                    <p
                      className={cn(
                        "mt-2 max-w-xs text-sm leading-6",
                        isDark ? "text-white/60" : "text-slate-500",
                      )}
                    >
                      Start the conversation with a quick reaction or a thought
                      about this reel.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div
            className={cn(
              "border-t px-4 py-4 backdrop-blur-xl sm:px-5",
              isDark
                ? "border-white/10 bg-black/40"
                : "border-slate-200 bg-white/95",
            )}
          >
            <CommentForm
              userProfile={currentProfile}
              postId={post?._id}
              className="space-y-0"
              avatarClassName="h-10 w-10"
              textareaClassName={cn(
                "min-h-[56px]",
                isDark
                  ? "border-white/10 bg-white/5 text-white placeholder:text-white/35 caret-white focus-visible:ring-emerald-400/50"
                  : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 caret-slate-900 focus-visible:ring-emerald-500/40",
              )}
              buttonClassName={cn(
                "shrink-0",
                isDark
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-emerald-600 hover:bg-emerald-700",
              )}
              placeholder="Write a comment for this reel..."
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ReelCommentsDialog;
