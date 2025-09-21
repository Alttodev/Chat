import { Controller, useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/lib/toast";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "../ui/textarea";
import { usePostInfo, usePostUpdate } from "@/hooks/postHooks";
import { useZustandPopup } from "@/lib/zustand";
import { useEffect, useMemo } from "react";
import { PostFormSkeleton } from "../skeleton/postFormSkeleton";

export function PostUpdateForm({ userProfile }) {
  const { closeModal, modalData } = useZustandPopup();
  const postId = modalData?.postId;
  const { data: postInfo, isFetching } = usePostInfo(postId);
  const { mutateAsync: updatePost } = usePostUpdate();

  const data = useMemo(() => postInfo, [postInfo]);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      postText: "",
    },
  });

  const onSubmit = async (formData) => {
    try {
      const res = await updatePost({ id: postId, formData: formData });
      toastSuccess(res?.message);
      closeModal();
      reset();
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (data) {
      reset({
        postText: data?.post?.postText || "",
      });
    }
  }, [data, reset]);

  if (isFetching) {
    return <PostFormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <Controller
            name="postText"
            control={control}
            rules={{ required: "Post text is required" }}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder={`What's on your mind, ${userProfile?.profile?.userName}?`}
                className="min-h-[125px] resize-none border-0 bg-muted focus:bg-background text-sm sm:text-base"
              />
            )}
          />
          {errors.postText?.message && (
            <p className="text-red-500 text-sm">{errors.postText?.message}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-25 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg shadow-sm transition cursor-pointer text-base"
        >
          {isSubmitting ? "Update..." : "Update"}
        </Button>
      </div>
    </form>
  );
}
