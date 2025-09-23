import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "@/lib/dateHelpers";
import { CommentForm } from "../form/CommentForm";
import { usePostComments } from "@/hooks/postHooks";
import { PostFormSkeleton } from "../skeleton/postFormSkeleton";
import { SkeletonComment } from "../skeleton/commentSkeleton";

export function CommentSection({ postId, userProfile }) {
  const { data: activeComments, isFetching } = usePostComments(postId);

  if (isFetching) {
    return <SkeletonComment />;
  }

  return (
    <div className="space-y-3   pt-5">
      <CommentForm userProfile={userProfile} postId={postId} />

      {/* Comments List */}
      {activeComments?.comments?.map((comment) => (
        <div key={comment.id} className="flex gap-2">
          <Avatar className="w-8 h-8 text-emerald-600">
            <AvatarFallback>
              {comment.user?.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium  text-muted-foreground text-sm">
                {comment.user?.userName}.
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelative(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm">{comment?.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
