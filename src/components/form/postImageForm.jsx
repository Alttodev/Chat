import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useZustandImagePopup } from "@/lib/zustand";
import { ImageUpload } from "../form_inputs/ImageUpload";
import { usePostCreate } from "@/hooks/postHooks";
import { toastError, toastSuccess } from "@/lib/toast";
import { useMemo, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import EmojiPickerButton from "../EmojiPickerButton";
import LocationPickerDialog from "../form_inputs/LocationPickerDialog";
import { appendLocationMarker } from "@/lib/location";

export function PostImageForm() {
  const { closeImageModal } = useZustandImagePopup();
  const { mutateAsync: createPost } = usePostCreate();
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

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

  const textValue = watch("postText");
  const imageValue = watch("image");
  const textareaRef = useRef(null);
  const hasText = textValue?.trim().length > 0;
  const hasImage = !!imageValue;

  const submitDisabled = useMemo(
    () => (!hasText || !hasImage) || isSubmitting,
    [hasText, hasImage, isSubmitting],
  );

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleLocationClear = () => {
    setSelectedLocation(null);
  };

  const onSubmit = async (formData) => {
    try {
      const data = new FormData();
      const trimmedText = formData.postText.trim();
      const postText = appendLocationMarker(
        trimmedText,
        selectedLocation,
      );

      data.append("postText", postText);
      if (formData.image) {
        data.append("image", formData.image);
      }

      const res = await createPost(data);
      toastSuccess(res?.message);
      reset();
      setSelectedLocation(null);
      closeImageModal(null);
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-3">
      <div className="relative space-y-1">
        <Controller
          name="postText"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              ref={textareaRef}
              placeholder="Enter description....."
              className={`min-h-[65px] resize-none border-0 bg-muted focus:bg-background text-sm sm:text-base overflow-y-auto thin-scrollbar ${
                selectedLocation?.name ? "pb-14" : ""
              }`}
            />
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
          className="flex h-10 w-10 items-center justify-center text-emerald-600 transition hover:bg-emerald-50"
        >
          <MapPin className="h-5 w-5 " />
        </span>
        <EmojiPickerButton
          textareaRef={textareaRef}
          setValue={setValue}
          getValues={getValues}
          name="postText"
          buttonClassName="rounded-md"
          pickerPlacement="down"
        />
      </div>

      <ImageUpload name="image" control={control} />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={submitDisabled}
          className="w-20 rounded-lg bg-emerald-600 py-3 text-base text-white shadow-sm transition hover:bg-emerald-700 cursor-pointer"
        >
          Post
        </Button>
      </div>

      <LocationPickerDialog
        open={isLocationPickerOpen}
        onOpenChange={setIsLocationPickerOpen}
        onSelect={handleLocationSelect}
      />
    </form>
  );
}
