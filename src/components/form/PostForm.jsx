import { Controller, useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/lib/toast";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "../ui/textarea";
import { usePostCreate } from "@/hooks/postHooks";
import { Paperclip } from "lucide-react";
import { useZustandImagePopup } from "@/lib/zustand";

export function PostForm({ userProfile }) {
  const { mutateAsync: createPost } = usePostCreate();
  const { openImageModal } = useZustandImagePopup();
  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      postText: "",
    },
  });

  const textValue = watch("postText");

  const onSubmit = async (formData) => {
    try {
      const res = await createPost(formData);
      toastSuccess(res?.message);
      reset();
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 text-emerald-600">
          <AvatarFallback>
            {userProfile?.profile?.userName?.charAt(0).toUpperCase() || "-"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Controller
            name="postText"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder={`What's on your mind, ${userProfile?.profile?.userName}?`}
                className="min-h-[125px] resize-none border-0 bg-muted focus:bg-background text-sm sm:text-base"
              />
            )}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <span
          onClick={openImageModal}
          className="w-12 h-12 flex items-center justify-center  ml-12
               text-emerald-600 
               transition cursor-pointer"
        >
          <Paperclip className="w-5 h-5" />
        </span>

        <Button
          type="submit"
          disabled={!textValue || isSubmitting}
          className="w-20 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg shadow-sm transition cursor-pointer text-base"
        >
          Post
        </Button>
      </div>
    </form>
  );
}
