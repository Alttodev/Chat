import { User, Mail, MapPin, Camera } from "lucide-react";
import TextInput from "../form_inputs/TextInput";
import ProfileImageUpload from "../form_inputs/ProfileImageUpload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@/lib/toast";
import { userSchema } from "@/lib/validation";
import { useUserUpdate } from "@/hooks/authHooks";
import { useEffect } from "react";
import { Button } from "../ui/button";

export function PersonalInfoForm({ userProfile, isEditing, closeEditing }) {
  const { mutateAsync: userUpdate } = useUserUpdate();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
      address: "",
      userName: "",
      profileImage: null,
    },
  });

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("userName", data.userName);
      formData.append("email", data.email);
      formData.append("address", data.address);

      if (data.profileImage) {
        formData.append("profileImage", data.profileImage);
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
      });
    }
  }, [userProfile, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isEditing && (
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
      )}

      <div className="grid gap-5">
        <div className="space-y-2">
          <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-foreground">
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
          <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-foreground">
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
          <label htmlFor="address" className="flex items-center gap-2 text-sm font-medium text-foreground">
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
      </div>

      {isEditing && (
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="
              bg-emerald-600
              hover:bg-emerald-700
              text-white
              rounded-full
              px-6
              h-10
              font-medium
              text-sm
              shadow-sm
              hover:shadow-md
              transition-all
              duration-200
              active:scale-95
              disabled:opacity-70
              disabled:cursor-not-allowed
            "
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </form>
  );
}