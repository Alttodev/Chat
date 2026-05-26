import { User, Mail, MapPin, Camera, BadgeInfo, Sparkles } from "lucide-react";
import TextInput from "../form_inputs/TextInput";
import ProfileImageUpload from "../form_inputs/ProfileImageUpload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@/lib/toast";
import { userSchema } from "@/lib/validation";
import { useUserUpdate } from "@/hooks/authHooks";
import { useEffect } from "react";
import { Button } from "../ui/button";
import ProfileTextAreaInput from "../form_inputs/ProfileTextarea";
import { useAIPromptStore } from "@/lib/zustand";
import AIPromptDialog from "../modals/aiPromptDialog";
import axiosInstance from "@/api/axiosInstance";

export function PersonalInfoForm({ userProfile, isEditing, closeEditing }) {
  const { mutateAsync: userUpdate } = useUserUpdate();
  const { setGenerating, openDialog, closeDialog } = useAIPromptStore();

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
      address: "",
      userName: "",
      bio: "",
      profileImage: null,
    },
  });

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

      setValue("bio", generatedText, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      closeDialog();
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("userName", data.userName);
      formData.append("email", data.email);
      formData.append("address", data.address);
      formData.append("bio", data.bio);

      if (data.profileImage) {
        formData.append("profileImage", data.profileImage);
      } else {
        formData.append("profileImage", "null");
      }

      const res = await userUpdate(formData);
      toastSuccess(res?.message || "Profile updated successfully");
      closeEditing?.(false);
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (userProfile) {
      reset({
        userName: userProfile?.profile?.userName || "",
        address: userProfile?.profile?.address || "",
        email: userProfile?.profile?.email || "",
        bio: userProfile?.profile?.bio || "",
        profileImage: null,
      });
    }
  }, [userProfile, reset]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {isEditing && (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <Camera className="h-4 w-4" />
              Profile photo
            </div>
            <div className="flex justify-center">
              <ProfileImageUpload
                name="profileImage"
                control={control}
                disabled={isSubmitting}
                defaultImage={userProfile?.profile?.profileImage}
              />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:gap-5">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <User className="h-4 w-4 text-emerald-600" />
              Full Name
            </label>
            <TextInput
              name="userName"
              control={control}
              disabled={!isEditing}
              className="bg-background"
            />
            {errors.userName?.message && (
              <p className="text-sm text-red-500">{errors.userName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <Mail className="h-4 w-4 text-emerald-600" />
              Email
            </label>
            <TextInput
              name="email"
              type="email"
              control={control}
              disabled={!isEditing}
              className="bg-background"
            />
            {errors.email?.message && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="address"
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <MapPin className="h-4 w-4 text-emerald-600" />
              Address
            </label>
            <TextInput
              name="address"
              control={control}
              disabled={!isEditing}
              className="bg-background"
            />
            {errors.address?.message && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="bio"
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <BadgeInfo className="h-4 w-4 text-emerald-600" />
              Bio
            </label>

            <ProfileTextAreaInput
              name="bio"
              control={control}
              disabled={!isEditing}
              rows={3}
              maxLength={150}
              placeholder="Write something about yourself..."
            />

            {isEditing && (
              <div className="flex justify-end">
                <span
                  onClick={() => openDialog("bio")}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-emerald-600 transition hover:bg-emerald-50 sm:h-10 sm:w-10"
                >
                  <Sparkles className="h-5 w-5 text-fuchsia-500" />
                </span>
              </div>
            )}

            {errors.bio?.message && (
              <p className="text-sm text-red-500">{errors.bio.message}</p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="
                h-9
                rounded-full
                bg-emerald-600
                px-5
                text-sm
                font-medium
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:bg-emerald-700
                hover:shadow-md
                active:scale-95
                disabled:cursor-not-allowed
                disabled:opacity-70
                sm:h-10
                sm:px-6
              "
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </form>

      <AIPromptDialog onGenerate={handleGenerateAI} />
    </>
  );
}