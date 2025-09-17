import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import TextInput from "../form_inputs/TextInput";
import { userSchema } from "@/lib/validation";
import { toastError, toastSuccess } from "@/lib/toast";
import { Button } from "../ui/button";
import { useUserCreate } from "@/hooks/authHooks";

const ProfileCreateForm = () => {
  const navigate = useNavigate();
  const { mutateAsync: userCreate } = useUserCreate();
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
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await userCreate(data);
      toastSuccess(res?.message);
      navigate("/home");
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <img
            src="/src/assets/logo.png"
            alt="Clix Logo"
            className="w-12 h-12"
          />
        </div>

        {/* Heading */}
        <div className="text-center mb-5">
          <p className="text-xl font-bold text-emerald-600">Profile Create</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col gap-1 ">
            <label className="text-[15px]">Name</label>
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
            <label className="block text-base font-medium text-gray-700 mb-1">
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
            <label className="text-[15px]">Address</label>
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
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg shadow-sm transition cursor-pointer text-base"
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCreateForm;
