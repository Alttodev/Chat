import { useForm } from "react-hook-form";
import { toastError } from "@/lib/toast";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePostComment } from "@/hooks/postHooks";
import TextInput from "../form_inputs/TextInput";
import { Send } from "lucide-react";
import { useImageModalStore } from "@/lib/zustand";

export function CommentForm({ userProfile, postId }) {
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 text-emerald-600">
          <AvatarImage
            onClick={() => open(userProfile?.profileImage)}
            className="cursor-pointer"
            src={userProfile?.profileImage || "/placeholder.svg"}
          />
          <AvatarFallback>
            {userProfile?.userName?.charAt(0).toUpperCase() || "-"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 gap-2">
          <TextInput
            name="comment"
            className="flex-1 text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm"
            control={control}
            placeholder="Write a comment..."
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          disabled={!commentValue || isSubmitting}
          className="w-12 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg shadow-sm transition cursor-pointer text-base"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
