import { Controller, useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/lib/toast";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { usePostInfo, usePostUpdate } from "@/hooks/postHooks";
import { useZustandPopup } from "@/lib/zustand";
import { useEffect, useMemo, useRef } from "react";
import { PostFormSkeleton } from "../skeleton/postFormSkeleton";
import EmojiPickerButton from "../EmojiPickerButton";

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
    watch,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      postText: "",
    },
  });

  const textValue = watch("postText");
  const textareaRef = useRef(null);

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
                ref={textareaRef}
                placeholder={`What's on your mind, ${userProfile?.profile?.userName}?`}
                className="min-h-[85px] resize-none border-0 bg-muted focus:bg-background text-sm sm:text-base"
              />
            )}
          />
          <EmojiPickerButton
            textareaRef={textareaRef}
            setValue={setValue}
            getValues={getValues}
            name="postText"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!textValue || isSubmitting}
          className="w-25 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg shadow-sm transition cursor-pointer text-base"
        >
          {isSubmitting ? "Update..." : "Update"}
        </Button>
      </div>
    </form>
  );
}
