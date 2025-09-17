import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Mail, Phone, MapPin } from "lucide-react";
import TextInput from "../form_inputs/TextInput";
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
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await userUpdate(data);

      toastSuccess(res?.message);
      closeEditing(false);
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
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Manage your personal details and contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1  gap-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </label>
              <TextInput
                name="userName"
                control={control}
                disabled={!isEditing}
                className="bg-card"
              />
              {errors.userName?.message && (
                <p className="text-red-500 text-sm">
                  {errors.userName?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <TextInput
                name="email"
                type="email"
                control={control}
                disabled={!isEditing}
                className="bg-card"
              />
              {errors.email?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </label>
              <TextInput
                name="address"
                control={control}
                disabled={!isEditing}
                className="bg-card"
              />
              {errors.address?.message && (
                <p className="text-red-500 text-sm">
                  {errors.address?.message}
                </p>
              )}
            </div>
            {isEditing ? (
              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-20 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg shadow-sm transition cursor-pointer text-base"
                >
                  {isSubmitting ? "Save..." : "Save"}
                </Button>
              </div>
            ) : null}
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
