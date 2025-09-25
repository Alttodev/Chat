import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetMailSchema } from "../../lib/validation";
import { toastError, toastSuccess } from "../../lib/toast";
import { PasswordInput } from "../form_inputs/PasswordInput";
import { useUserResetPassword } from "@/hooks/authHooks";

const ResetMailForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const id = searchParams.get("id");
  const token = searchParams.get("token");

  const { mutateAsync: userReset } = useUserResetPassword();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetMailSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await userReset({
        id,
        token,
        password: data.password,
      });
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
          <p className="text-xl font-bold text-emerald-600">Reset Password</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">
              Password
            </label>
            <PasswordInput
              name="password"
              control={control}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
            {errors.password?.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password?.message}
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

export default ResetMailForm;
