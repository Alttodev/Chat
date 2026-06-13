import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useZustandImagePopup } from "@/lib/zustand";
import { ImageUpload } from "../form_inputs/ImageUpload";
import { usePostCreate } from "@/hooks/postHooks";
import { toastError, toastSuccess } from "@/lib/toast";
import { useMemo, useRef, useState } from "react";
import { Loader2, MapPin, Sparkles, X } from "lucide-react";
import LocationPickerDialog from "../form_inputs/LocationPickerDialog";
import { appendLocationMarker } from "@/lib/location";
import axiosInstance from "@/api/axiosInstance";

import { useAIPromptStore } from "@/lib/zustand";
import AIPromptDialog from "../modals/aiPromptDialog";
import { useAuthStore } from "@/store/authStore";

export function PostImageForm() {
  const { closeImageModal } = useZustandImagePopup();
  const userId = useAuthStore((state) => state.user?.userName);
  const { mutateAsync: createPost } = usePostCreate();
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { openDialog, setGenerating, closeDialog } = useAIPromptStore();

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      postText: "",
      image: "",
    },
  });

  const imageValue = watch("image");
  const textareaRef = useRef(null);

  const hasImage = !!imageValue;

  const submitDisabled = useMemo(
    () => !hasImage || isSubmitting,
    [hasImage, isSubmitting],
  );

  const getSuccessMessage = (message, fallback) => {
    if (typeof message === "string" && !/server error/i.test(message)) {
      return message;
    }

    return fallback;
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleLocationClear = () => {
    setSelectedLocation(null);
  };

  const handleGenerateAI = async (prompt) => {
    try {
      setGenerating(true);

      const res = await axiosInstance.post("/ai/post-caption", {
        prompt,
      });

      const generatedText = res?.data?.text?.trim();

      if (!generatedText) {
        toastError("AI did not return any text");
        return;
      }

      setValue("postText", generatedText, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      closeDialog();
      textareaRef.current?.focus();
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const onSubmit = async (formData) => {
    try {
      const data = new FormData();
      const trimmedText = formData.postText.trim();
      const postText = appendLocationMarker(trimmedText, selectedLocation);

      data.append("postText", postText);
      if (formData.image && formData.image.length > 0) {
        formData.image.forEach((file) => {
          data.append("image", file);
        });
      }

      const res = await createPost(data);
      toastSuccess(
        getSuccessMessage(res?.message, "Media uploaded successfully"),
      );
      reset();
      setSelectedLocation(null);
      closeImageModal(null);
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-3">
        <div className="relative space-y-1">
          <Controller
            name="postText"
            control={control}
            rules={{
              required: "Post description is required",
              validate: (value) =>
                value.trim().length > 0 || "Post description is required",
            }}
            render={({ field, fieldState }) => (
              <>
                <Textarea
                  {...field}
                  ref={textareaRef}
                  placeholder={`What's on your mind, ${userId}?`}
                  className={`min-h-[120px] resize-none border-0 bg-muted focus:bg-background text-sm sm:text-base overflow-y-auto thin-scrollbar ${
                    selectedLocation?.name ? "pb-14" : ""
                  } `}
                />

                {fieldState.error && (
                  <p className="mt-1 text-sm text-red-500">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />

          {selectedLocation?.name ? (
            <div className="pointer-events-none absolute bottom-3 left-3 right-3">
              <div className="flex w-full max-w-full items-center gap-1 overflow-hidden rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-100 sm:text-sm">
                <a
                  href={selectedLocation.url}
                  target="_blank"
                  rel="noreferrer"
                  className="pointer-events-auto flex min-w-0 flex-1 items-center gap-1 overflow-hidden transition-colors hover:text-emerald-800"
                >
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="min-w-0 truncate">
                    {selectedLocation.name}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={handleLocationClear}
                  className="pointer-events-auto ml-auto shrink-0 rounded-full p-0.5 text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-800"
                  aria-label="Remove location"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <span
            onClick={() => setIsLocationPickerOpen(true)}
            className="flex h-10 w-10 items-center justify-center text-emerald-600 transition hover:bg-emerald-50 cursor-pointer rounded-full"
          >
            <MapPin className="h-5 w-5 " />
          </span>

          <span
            onClick={() => openDialog("post")}
            className="flex h-10 w-10 items-center justify-center text-sky-500 transition hover:bg-sky-50 cursor-pointer rounded-full"
          >
            <Sparkles className="h-5 w-5 text-sky-500" />
          </span>
        </div>

        <ImageUpload name="image" control={control} />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={submitDisabled}
            className="
              bg-emerald-600
              hover:bg-emerald-700
              text-white
              rounded-full
              px-5
              h-10
              font-medium
              text-sm
              shadow-sm
              hover:shadow-md
              transition-all
              duration-200
              active:scale-95
              cursor-pointer
              disabled:opacity-70
              disabled:cursor-not-allowed
            "
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>Post</>
            )}
          </Button>
        </div>

        <LocationPickerDialog
          open={isLocationPickerOpen}
          onOpenChange={setIsLocationPickerOpen}
          onSelect={handleLocationSelect}
        />
      </form>

      <AIPromptDialog onGenerate={handleGenerateAI} />
    </>
  );
}
