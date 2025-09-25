import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useZustandImagePopup } from "@/lib/zustand";
import { ImageUpload } from "../form_inputs/ImageUpload";

export function PostImageForm() {
  const { closeImageModal } = useZustandImagePopup();

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      postText: "",
      image: null,
    },
  });

  const textValue = watch("image");

  const onSubmit = async (formData) => {
    try {
      console.log("Submitting:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      reset();
      closeImageModal(null);
      console.log("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1">
        <Controller
          name="postText"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Enter description....."
              className="min-h-[65px] resize-none border-0 bg-muted focus:bg-background text-sm sm:text-base"
            />
          )}
        />
      </div>

      {/* Reusable Upload Component */}
      <ImageUpload name="image" control={control} />

      {/* Action Buttons */}
      <div className="flex justify-end ">
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
