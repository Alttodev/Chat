import { Controller, useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/lib/toast";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { usePostInfo, usePostUpdate } from "@/hooks/postHooks";
import { useZustandPopup } from "@/lib/zustand";
import { useEffect, useMemo, useRef, useState } from "react";
import { PostFormSkeleton } from "../skeleton/postFormSkeleton";
import { appendLocationMarker, extractLocationMarker } from "@/lib/location";
import { MapPin, X } from "lucide-react";

export function PostUpdateForm({ userProfile }) {
  const { closeModal, modalData } = useZustandPopup();
  const postId = modalData?.postId;
  const { data: postInfo, isFetching } = usePostInfo(postId);
  const { mutateAsync: updatePost } = usePostUpdate();
  const locationRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const data = useMemo(() => postInfo, [postInfo]);

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
  const textareaRef = useRef(null);
  const hasText = textValue?.trim().length > 0;
  const submitDisabled = (!hasText && !selectedLocation) || isSubmitting;

  const handleLocationClear = () => {
    setSelectedLocation(null);
  };

  const onSubmit = async (formData) => {
    try {
      const postText = appendLocationMarker(
        formData.postText.trim(),
        selectedLocation,
      );
      const res = await updatePost({
        id: postId,
        formData: { ...formData, postText },
      });
      toastSuccess(res?.message);
      closeModal();
      reset();
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (data) {
      const parsed = extractLocationMarker(data?.post?.postText || "");
      locationRef.current = parsed.location;
      setSelectedLocation(parsed.location);
      reset({
        postText: parsed.text,
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
            rules={{
              validate: (value) =>
                value?.trim().length > 0 || "Post text is required",
            }}
            render={({ field }) => (
              <div className="relative">
                <Textarea
                  {...field}
                  ref={textareaRef}
                  placeholder={`What's on your mind, ${userProfile?.profile?.userName}?`}
                  className={`min-h-[85px] resize-none border-0 bg-muted focus:bg-background text-sm sm:text-base overflow-y-auto thin-scrollbar ${
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
                        <MapPin className="h-3.5 w-3.5" />
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
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={submitDisabled}
          className="
    min-w-[100px]
    h-10
    rounded-full
    bg-emerald-600
    hover:bg-emerald-700
    text-white
    px-5
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
          {isSubmitting ? "Updating..." : "Update"}
        </Button>
      </div>
    </form>
  );
}
