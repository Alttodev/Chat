import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "@/lib/dateHelpers";
import { CommentForm } from "../form/CommentForm";
import { usePostCommentDelete, usePostComments } from "@/hooks/postHooks";
import { SkeletonComment } from "../skeleton/commentSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { toastError, toastSuccess } from "@/lib/toast";

export function CommentSection({ postId, userProfile, post }) {
  const { data: activeComments, isFetching } = usePostComments(postId);
  const { mutateAsync: deleteComment } = usePostCommentDelete();

  const handleDelete = async ({ postId, commentId }) => {
    try {
      const res = await deleteComment({ postId: postId, commentId: commentId });
      toastSuccess(res?.message);
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  if (isFetching) {
    return <SkeletonComment />;
  }

  return (
    <div className="space-y-3   pt-5">
      <CommentForm userProfile={userProfile} postId={postId} />

      {/* Comments List */}
      {activeComments?.comments?.map(
        (comment) => (
          console.log(comment.user, "user"),
          console.log(post, "id"),
          (
            <div key={comment._id} className="flex gap-2">
              <Avatar className="w-8 h-8 text-emerald-600">
                <AvatarFallback>
                  {comment.user?.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1 justify-between">
                  <div className="flex gap-2 items-center">
                    <span className="font-medium text-muted-foreground text-sm">
                      {comment.user?.userName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(comment.createdAt)}
                    </span>
                  </div>

                  {comment.editable && (
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
                          <span className="text-red-500 font-medium">
                            Delete
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <p className="text-sm">{comment?.comment}</p>
              </div>
            </div>
          )
        )
      )}
    </div>
  );
}
