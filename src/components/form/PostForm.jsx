import { Controller, useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/lib/toast";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { usePostCreate } from "@/hooks/postHooks";
import { usePollCreate } from "@/hooks/pollHooks";
import {
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  X,
  BarChart3,
} from "lucide-react";
import {
  useAIPromptStore,
  useZustandFormPopup,
  useZustandImagePopup,
} from "@/lib/zustand";
import { useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import LocationPickerDialog from "../form_inputs/LocationPickerDialog";
import { appendLocationMarker } from "@/lib/location";
import axiosInstance from "@/api/axiosInstance";
import AIPromptDialog from "../modals/aiPromptDialog";
import { useAuthStore } from "@/store/authStore";

export function PostForm({ userProfile, aiTarget = "post" }) {
  const { mutateAsync: createPost } = usePostCreate();
  const { mutateAsync: createPoll } = usePollCreate();
  const userId = useAuthStore((state) => state.user?.userName);
  const { openImageModal } = useZustandImagePopup();
  const { closeFormModal } = useZustandFormPopup();
  const { setGenerating, closeDialog, openDialog } = useAIPromptStore();
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [mode, setMode] = useState("post");

  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollSubmitting, setPollSubmitting] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
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

  const cleanPollOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
  const pollSubmitDisabled =
    !pollQuestion.trim() || cleanPollOptions.length < 2 || pollSubmitting;

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
      const trimmedText = formData.postText.trim();
      const postText = appendLocationMarker(trimmedText, selectedLocation);
      const res = await createPost({ ...formData, postText });
      toastSuccess(
        getSuccessMessage(res?.message, "Post uploaded successfully"),
      );
      reset();
      closeFormModal();
      setSelectedLocation(null);
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  const updatePollOption = (i, value) => {
    setPollOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  };

  const addPollOption = () => {
    if (pollOptions.length >= 4) return;
    setPollOptions((prev) => [...prev, ""]);
  };

  const removePollOption = (i) => {
    if (pollOptions.length <= 2) return;
    setPollOptions((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handlePollSubmit = async () => {
    if (pollSubmitDisabled) return;
    setPollSubmitting(true);
    try {
      const res = await createPoll({
        question: pollQuestion.trim(),
        options: cleanPollOptions,
      });
      toastSuccess(getSuccessMessage(res?.message, "Poll posted successfully"));
      setPollQuestion("");
      setPollOptions(["", ""]);
      setMode("post");
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setPollSubmitting(false);
    }
  };

  const handleFormSubmit = (e) => {
    if (mode === "poll") {
      e.preventDefault();
      return handlePollSubmit();
    }
    return handleSubmit(onSubmit)(e);
  };

  return (
    <>
      <form onSubmit={handleFormSubmit} className="relative space-y-2">
        {userProfile?.profile?.profileImage && (
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 text-emerald-600">
              <AvatarImage
                className="h-full w-full object-cover object-top"
                src={userProfile?.profile?.profileImage || "/placeholder.svg"}
              />
              <AvatarFallback>
                {userProfile?.profile?.userName?.charAt(0).toUpperCase() || "-"}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center">
              <p className="text-sm font-medium sm:text-base">
                {userProfile?.profile?.userName}
              </p>
            </div>
          </div>
        )}

        {/* Post / Poll tab switch */}
        <div className="flex gap-1 rounded-full bg-muted p-1 w-fit">
          <button
            type="button"
            onClick={() => setMode("post")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
              mode === "post"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Post
          </button>
          <button
            type="button"
            onClick={() => setMode("poll")}
            className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
              mode === "poll"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Poll
          </button>
        </div>

        {mode === "post" ? (
          <>
            <div className="relative flex-1">
              <Controller
                name="postText"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Textarea
                      {...field}
                      ref={textareaRef}
                      placeholder={`What's on your mind, ${userProfile?.profile?.userName || userId}?`}
                      autoComplete="on"
                      autoCorrect="on"
                      spellCheck={true}
                      autoCapitalize="sentences"
                      inputMode="text"
                      enterKeyHint="send"
                      className={`
                        min-h-[100px]
                        resize-none
                        border-0
                        bg-muted
                        focus:bg-background
                        text-sm sm:text-base
                        overflow-y-auto
                        thin-scrollbar
                        touch-manipulation
                        whitespace-pre-wrap
                        break-words
                        leading-relaxed
                        ${selectedLocation?.name ? "pb-14" : ""}
                      `}
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
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-emerald-600 transition hover:bg-emerald-50"
                >
                  <MapPin className="w-5 h-5" />
                </span>

                <span
                  onClick={openImageModal}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-emerald-600 transition hover:bg-emerald-50"
                >
                  <ImagePlus className="w-5 h-5" />
                </span>

                <span
                  onClick={() => openDialog(aiTarget)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-emerald-600 transition hover:bg-emerald-50"
                >
                  <Sparkles className="h-5 w-5 text-sky-500" />
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
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Textarea
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask something…"
                maxLength={150}
                className="min-h-[60px] resize-none border-0 bg-muted text-sm focus:bg-background sm:text-base"
              />

              <div className="space-y-2">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={opt}
                      onChange={(e) => updatePollOption(i, e.target.value)}
                      maxLength={80}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 rounded-full border border-border/60 bg-muted px-4 py-2 text-sm focus:border-emerald-400 focus:bg-background focus:outline-none"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(i)}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="flex items-center gap-1 px-1 text-xs font-medium text-emerald-600 hover:text-emerald-500 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add option
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={pollSubmitDisabled}
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
                {pollSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>Post poll</>
                )}
              </Button>
            </div>
          </>
        )}

        <LocationPickerDialog
          open={isLocationPickerOpen}
          onOpenChange={setIsLocationPickerOpen}
          onSelect={handleLocationSelect}
        />
      </form>

      <AIPromptDialog target={aiTarget} onGenerate={handleGenerateAI} />
    </>
  );
}
