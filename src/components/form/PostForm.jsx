import { Controller, useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/lib/toast";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { usePostCreate } from "@/hooks/postHooks";
import { ImagePlus, MapPin, X } from "lucide-react";
import { useZustandImagePopup } from "@/lib/zustand";
import { useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import LocationPickerDialog from "../form_inputs/LocationPickerDialog";
import { appendLocationMarker } from "@/lib/location";

export function PostForm({ userProfile }) {
  const { mutateAsync: createPost } = usePostCreate();
  const { openImageModal } = useZustandImagePopup();
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const {
    handleSubmit,
    control,
    reset,
    watch,

    formState: { isSubmitting },
  } = useForm({
    defaultValues: { postText: "" },
  });

  const textValue = watch("postText");
  const textareaRef = useRef(null);
  const hasText = textValue?.trim().length > 0;

  const submitDisabled = useMemo(
    () => (!hasText && !selectedLocation) || isSubmitting,
    [hasText, isSubmitting, selectedLocation],
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

  const onSubmit = async (formData) => {
    try {
      const trimmedText = formData.postText.trim();
      const postText = appendLocationMarker(trimmedText, selectedLocation);
      const res = await createPost({ ...formData, postText });
      toastSuccess(
        getSuccessMessage(res?.message, "Post uploaded successfully"),
      );
      reset();
      setSelectedLocation(null);
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 relative">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 text-emerald-600">
          <AvatarImage
            className="w-full h-full object-cover object-top"
            src={userProfile?.profile?.profileImage || "/placeholder.svg"}
          />
          <AvatarFallback>
            {userProfile?.profile?.userName?.charAt(0).toUpperCase() || "-"}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center">
          <p className="font-medium text-sm sm:text-base">
            {userProfile?.profile?.userName}
          </p>
        </div>
      </div>
      <div className="flex-1 relative">
        <Controller
          name="postText"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <Textarea
                {...field}
                ref={textareaRef}
                placeholder={`What's on your mind, ${userProfile?.profile?.userName}?`}
                autoComplete="on"
                autoCorrect="on"
                spellCheck={true}
                autoCapitalize="sentences"
                inputMode="text"
                className={`min-h-[100px] resize-none border-0 bg-muted focus:bg-background text-sm sm:text-base overflow-y-auto thin-scrollbar ${
                  selectedLocation?.name ? "pb-14" : ""
                }`}
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
          )}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <span
            onClick={() => setIsLocationPickerOpen(true)}
            className="flex h-10 w-10 items-center justify-center text-emerald-600 transition hover:bg-emerald-50"
          >
            <MapPin className="w-5 h-5" />
          </span>

          <span
            onClick={openImageModal}
            className="flex h-10 w-10 items-center justify-center text-emerald-600 transition hover:bg-emerald-50"
          >
            <ImagePlus className="w-5 h-5" />
          </span>
        </div>

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
