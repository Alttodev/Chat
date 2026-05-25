import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "@/lib/dateHelpers";
import { CommentForm } from "../form/CommentForm";
import {
  usePostCommentDelete,
  usePostCommentReaction,
  usePostComments,
} from "@/hooks/postHooks";
import { SkeletonComment } from "../skeleton/commentSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  CornerDownRight,
  MessageSquareText,
  MoreHorizontal,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { toastError } from "@/lib/toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { renderMentionText } from "@/lib/mentionText";
import { cn } from "@/lib/utils";

export function CommentSection({ postId, userProfile, highlightCommentId }) {
  const { profileId } = useAuthStore();
  const navigate = useNavigate();
  const { data: activeComments, isLoading } = usePostComments(postId);
  const { mutateAsync: deleteComment } = usePostCommentDelete();
  const { mutateAsync: reactToComment } = usePostCommentReaction();
  const lastHighlightedCommentIdRef = useRef(null);
  const [replyToComment, setReplyToComment] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [reactionLoadingCommentId, setReactionLoadingCommentId] =
    useState(null);

  useEffect(() => {
    if (!highlightCommentId) return;

    if (lastHighlightedCommentIdRef.current === highlightCommentId) return;

    const commentElement = document.getElementById(
      `comment-${highlightCommentId}`,
    );

    if (!commentElement) return;

    lastHighlightedCommentIdRef.current = highlightCommentId;

    commentElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeComments?.comments, highlightCommentId]);

  const handleDelete = async ({ postId, commentId }) => {
    try {
      await deleteComment({ postId: postId, commentId: commentId });
      // toastSuccess(res?.message);
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleReaction = async ({ commentId, type }) => {
    setReactionLoadingCommentId(commentId);
    try {
      await reactToComment({ postId, commentId, type });
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setReactionLoadingCommentId((current) =>
        current === commentId ? null : current,
      );
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: prev[commentId] === false,
    }));
  };

  const renderCommentNode = (comment, level = 0) => {
    const threadedReplies = comment?.replies || [];
    const isNested = level > 0;
    const isReplyingToThisComment = replyToComment?.commentId === comment._id;
    const areRepliesOpen = expandedReplies[comment._id] !== false;
    const hasReplies = threadedReplies.length > 0;
    const likeCount = comment?.likeCount || 0;
    const dislikeCount = comment?.dislikeCount || 0;
    const isLiked = comment?.myReaction === "like";
    const isDisliked = comment?.myReaction === "dislike";

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
              ? "relative border-l border-muted-foreground/15 pl-2.5 pt-1.5"
              : "rounded-lg",
            highlightCommentId === comment._id && "bg-muted/30",
          )}
        >
          {isNested ? (
            <CornerDownRight className="absolute -left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/50" />
          ) : null}

          <Avatar
            className={cn("text-emerald-600", isNested ? "w-7 h-7" : "w-8 h-8")}
          >
            <AvatarImage
              onClick={
                profileId !== comment?.user?._id
                  ? () => navigate(`/users/${comment?.user?._id}`)
                  : undefined
              }
              className={cn(
                "w-full h-full object-cover object-top",
                profileId !== comment?.user?._id
                  ? "cursor-pointer"
                  : "cursor-default",
              )}
              src={comment?.user?.profileImage || "/placeholder.svg"}
            />
            <AvatarFallback>
              {comment?.user?.userName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div
            className={cn(
              "flex-1",
              isNested
                ? "rounded-none border-0 bg-transparent p-0"
                : "bg-muted rounded-lg p-3",
            )}
          >
            <div className="flex items-center gap-2 mb-1 justify-between">
              <div className="flex gap-2 items-center">
                <span className="font-medium text-muted-foreground text-sm">
                  {comment?.user?.userName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelative(comment?.createdAt)}
                </span>
              </div>

              {comment?.editable && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <span className="relative cursor-pointer border-0 rounded-full p-1 hover:bg-slate-100 transition-colors duration-200">
                      <MoreHorizontal className="w-4 h-4" />
                      <span className="sr-only">Toggle user menu</span>
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className=" mt-1 border-slate-200 shadow-lg"
                    sideOffset={8}
                  >
                    <DropdownMenuItem
                      className="cursor-pointer transition-colors duration-200 mt-1"
                      onClick={() =>
                        handleDelete({
                          postId,
                          commentId: comment._id,
                        })
                      }
                    >
                      <Trash2 className="mr-1 h-4 w-4 text-slate-500  transition-colors duration-200" />
                      <span className="text-red-500 font-medium">Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p
              className="text-sm whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{
                __html: renderMentionText(comment?.comment),
              }}
            />

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
                  isLiked && "text-neutral-700 dark:text-neutral-300",
                )}
                disabled={reactionLoadingCommentId === comment._id}
                onClick={() =>
                  handleReaction({ commentId: comment._id, type: "like" })
                }
              >
                <ThumbsUp
                  className={cn(
                    "h-3.5 w-3.5 transition-all",
                    isLiked
                      ? "fill-current text-neutral-700 dark:text-neutral-300"
                      : "text-current",
                  )}
                />

                <span>{likeCount}</span>
              </button>

              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
                  isDisliked && "text-neutral-700 dark:text-neutral-300",
                )}
                disabled={reactionLoadingCommentId === comment._id}
                onClick={() =>
                  handleReaction({ commentId: comment._id, type: "dislike" })
                }
              >
                <ThumbsDown
                  className={cn(
                    "h-3.5 w-3.5 transition-all",
                    isDisliked
                      ? "fill-current text-neutral-700 dark:text-neutral-300"
                      : "text-current",
                  )}
                />
                <span>{dislikeCount}</span>
              </button>

              {hasReplies ? (
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-medium  transition-colors hover:none cursor-pointer",
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
                    className="text-xs font-medium text-muted-foreground transition-colors  hover:none cursor-pointer"
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
                      className="text-xs font-medium text-muted-foreground transition-colors hover:none cursor-pointer"
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
                  userProfile={userProfile}
                  postId={postId}
                  parentCommentId={comment._id}
                  replyToUserName={comment?.user?.userName}
                  className="w-full"
                  avatarClassName="h-7 w-7"
                  textareaClassName="min-h-[48px] text-sm"
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

  if (isLoading) {
    return <SkeletonComment />;
  }

  return (
    <div className="space-y-3   pt-5">
      <div className="text-sm text-muted-foreground">
        Comments {activeComments?.comments?.length}
      </div>
      <CommentForm userProfile={userProfile} postId={postId} />

      {/* Comments List */}
      <div className="space-y-3">
        {(activeComments?.comments || []).map((comment) =>
          renderCommentNode(comment),
        )}
      </div>
    </div>
  );
}
