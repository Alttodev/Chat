import { Controller, useForm } from "react-hook-form";
import { toastError } from "@/lib/toast";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePostComment } from "@/hooks/postHooks";
import { Send } from "lucide-react";
import { useImageModalStore } from "@/lib/zustand";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";

export function CommentForm({
  userProfile,
  postId,
  parentCommentId,
  replyToUserName,
  className,
  avatarClassName,
  textareaClassName,
  buttonClassName,
  placeholder,
  onSuccess,
}) {
  const { open } = useImageModalStore();
  const { mutateAsync: createComment } = usePostComment();

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      comment: "",
    },
  });

  const commentValue = watch("comment");
  const resolvedPlaceholder =
    placeholder ||
    (parentCommentId
      ? `Reply to ${replyToUserName || "comment"}...`
      : "Write a comment...");

  const onSubmit = async (formData) => {
    try {
      await createComment({
        id: postId,
        formData: {
          ...formData,
          ...(parentCommentId
            ? {
                parentCommentId,
                parentId: parentCommentId,
                replyToCommentId: parentCommentId,
              }
            : {}),
        },
      });
      reset();
      onSuccess?.();
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("w-full", className)}>
      <div className="flex gap-3">
        <Avatar className={cn("h-8 w-8 text-emerald-600", avatarClassName)}>
          <AvatarImage
            onClick={() => open(userProfile?.profileImage)}
            className="w-full h-full object-cover object-top cursor-pointer"
            src={userProfile?.profileImage || "/placeholder.svg"}
          />
          <AvatarFallback>
            {userProfile?.userName?.charAt(0).toUpperCase() || "-"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 gap-2">
          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder={resolvedPlaceholder}
                disabled={isSubmitting}
                className={cn(
                  "min-h-[60px] resize-none text-sm placeholder:text-xs sm:text-base sm:placeholder:text-sm",
                  "border-input bg-background text-foreground caret-foreground",
                  textareaClassName,
                )}
              />
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={!commentValue || isSubmitting}
          className={cn(
            `
      h-11
      w-11
      rounded-full
      bg-emerald-600
      hover:bg-emerald-700
      text-white
      shadow-sm
      hover:shadow-md
      transition-all
      duration-200
      active:scale-95
      cursor-pointer
      disabled:opacity-70
      disabled:cursor-not-allowed
      flex
      items-center
      justify-center
    `,
            buttonClassName,
          )}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
