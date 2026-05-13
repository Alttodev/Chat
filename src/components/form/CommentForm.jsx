import { useForm } from "react-hook-form";
import { toastError } from "@/lib/toast";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePostComment } from "@/hooks/postHooks";
import { Send } from "lucide-react";
import { useImageModalStore } from "@/lib/zustand";
import MentionTextarea from "../form_inputs/MentionTextarea";
import { cn } from "@/lib/utils";

export function CommentForm({
  userProfile,
  postId,
  className,
  avatarClassName,
  textareaClassName,
  mirrorClassName,
  mirrorTextClassName,
  placeholderClassName,
  highlightClassName,
  buttonClassName,
  placeholder = "Write a comment...",
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

  const onSubmit = async (formData) => {
    try {
      await createComment({ id: postId, formData: formData });
      reset();
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
          <MentionTextarea
            name="comment"
            className={cn(
              "flex-1 text-sm placeholder:text-xs sm:text-base sm:placeholder:text-sm",
              textareaClassName,
            )}
            mirrorClassName={mirrorClassName}
            mirrorTextClassName={mirrorTextClassName}
            placeholderClassName={placeholderClassName}
            highlightClassName={highlightClassName}
            control={control}
            placeholder={placeholder}
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          disabled={!commentValue || isSubmitting}
          className={cn(
            "h-12 w-12 rounded-lg bg-emerald-600 py-3 text-base text-white shadow-sm transition hover:bg-emerald-700",
            buttonClassName,
          )}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
