import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useZustandImagePopup } from "@/lib/zustand";
import { ImageUpload } from "../form_inputs/ImageUpload";
import { usePostCreate } from "@/hooks/postHooks";
import { toastError, toastSuccess } from "@/lib/toast";
import { useRef } from "react";
import EmojiPickerButton from "../EmojiPickerButton";

export function PostImageForm() {
  const { closeImageModal } = useZustandImagePopup();
  const { mutateAsync: createPost } = usePostCreate();

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
      image: "",
    },
  });

  const textValue = watch("image");
  const imageValue = watch("image");
  const textareaRef = useRef(null);

  const onSubmit = async (formData) => {
    try {
      const data = new FormData();
      data.append("postText", formData.postText);
      if (formData.image) {
        data.append("image", formData.image);
      }

      const res = await createPost(data);
      toastSuccess(res?.message);
      reset();
      closeImageModal(null);
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1 relative">
        <Controller
          name="postText"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              ref={textareaRef}
              placeholder="Enter description....."
              className="min-h-[65px] resize-none border-0 bg-muted focus:bg-background text-sm sm:text-base pr-10  overflow-y-auto thin-scrollbar"
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

      <ImageUpload name="image" control={control} />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={(!textValue && !imageValue) || isSubmitting}
          className="w-20 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg shadow-sm transition cursor-pointer text-base"
        >
          Post
        </Button>
      </div>
    </form>
  );
}
