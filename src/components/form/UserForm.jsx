import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import TextInput from "../form_inputs/TextInput";
import ProfileImageUpload from "../form_inputs/ProfileImageUpload";
import { userSchema } from "@/lib/validation";
import { toastError, toastSuccess } from "@/lib/toast";
import { Button } from "../ui/button";
import { useUserCreate } from "@/hooks/authHooks";
import { getProfile } from "@/api/axios";
import { useSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import messageBg from "@/assets/bgwallpaper.png";
import { Camera } from "lucide-react";

const MOBILE_FOLLOW_SUGGESTIONS_HIDDEN_KEY = "mobile-follow-suggestions-hidden";

const ProfileCreateForm = () => {
  const navigate = useNavigate();
  const { mutateAsync: userCreate } = useUserCreate();
  const { user, setProfileId } = useAuthStore();

  const { connectSocket } = useSocket();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      userName: "",
      address: "",
      email: "",
      profileImage: null,
    },
  });

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("userName", data.userName);
      formData.append("email", data.email);
      formData.append("address", data.address);

      // Add profile image as binary if present
      if (data.profileImage) {
        formData.append("profileImage", data.profileImage);
      }

      const res = await userCreate(formData);
      connectSocket(user?._id);
      toastSuccess(res?.message);
      const resp = await getProfile();
      const profileId = resp?.profile?.id;

      if (profileId) {
        setProfileId(profileId);
        sessionStorage.setItem("login-at", String(Date.now()));
        sessionStorage.removeItem("profile-image-reminder-shown");
        sessionStorage.removeItem(MOBILE_FOLLOW_SUGGESTIONS_HIDDEN_KEY);
        sessionStorage.setItem(
          "welcome-post-pending",
          JSON.stringify({
            profileId,
            userName:
              resp?.profile?.userName ||
              user?.userName ||
              data?.userName ||
              "there",
          }),
        );
      }

      navigate("/home");
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div
        className="absolute z-0 inset-0 bg-cover bg-center bg-no-repeat opacity-[0.56]"
        style={{ backgroundImage: `url(${messageBg})` }}
      />
      <div className="relative z-0 w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        {/* Logo */}

        {/* Heading */}
        <div className="text-center mb-5">
          <p className="text-xl font-bold text-emerald-600">Profile Create</p>
        </div>

        {/* Profile Image Upload */}
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-700">
            <Camera className="h-4 w-4" />
            Profile photo
          </div>
          <div className="flex justify-center">
            <ProfileImageUpload
              name="profileImage"
              control={control}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col gap-1 ">
            <label className="!text-sm">Name</label>
            <TextInput
              name="userName"
              control={control}
              placeholder="Name"
              disabled={isSubmitting}
            />
            {errors.userName?.message && (
              <p className="text-red-500 text-sm">{errors.userName?.message}</p>
            )}
          </div>
          <div>
            <label className="block !text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <TextInput
              name="email"
              control={control}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
            {errors.email?.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email?.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <label className="!text-sm">Address</label>
            <TextInput
              name="address"
              control={control}
              placeholder="Address"
              disabled={isSubmitting}
            />
            {errors.address?.message && (
              <p className="text-red-500 text-sm">{errors.address?.message}</p>
            )}
          </div>
          <div className="mb-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="
    w-full
    h-11
    rounded-full
    bg-emerald-600
    hover:bg-emerald-700
    text-white
    font-medium
    text-sm
    shadow-sm
    hover:shadow-md
    transition-all
    duration-200
    active:scale-[0.98]
    cursor-pointer
    disabled:opacity-70
    disabled:cursor-not-allowed
  "
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCreateForm;
