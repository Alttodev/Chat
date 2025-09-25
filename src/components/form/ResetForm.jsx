import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { resetSchema } from "../../lib/validation";
import { toastError, toastSuccess } from "../../lib/toast";
import TextInput from "../form_inputs/TextInput";
import { useUserReset } from "@/hooks/authHooks";

const ResetForm = () => {
  const navigate = useNavigate();
  const { mutateAsync: userReset } = useUserReset();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await userReset(data);
      navigate("/");
      toastSuccess(res?.message);
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
          <p className="text-xl font-bold text-emerald-600">Reset</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg shadow-sm transition cursor-pointer text-base"
          >
             Submit
          </Button>
        </form>

        <div className="flex justify-between mt-6">
          <div className="text-sm text-gray-600">
            Back to &nbsp;
            <Link to="/" className="text-emerald-600">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetForm;
