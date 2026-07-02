import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetMailSchema } from "../../lib/validation";
import { toastError, toastSuccess } from "../../lib/toast";
import { PasswordInput } from "../form_inputs/PasswordInput";
import { useUserResetPassword } from "@/hooks/authHooks";
import logo from "@/assets/logo.png";
import { Loader2 } from "lucide-react";

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
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-y-auto bg-gradient-to-br from-emerald-50 via-white to-green-100 px-3 py-3 sm:px-6 sm:py-6 lg:px-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md rounded-[32px] border border-white/70 bg-white/95 p-4 shadow-2xl shadow-emerald-100/70 backdrop-blur-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/20">
        {/* Logo */}
        <div className="mb-2 flex justify-center">
          <img src={logo} alt="Clix Logo" className="w-12 h-12" />
        </div>

        {/* Heading */}
        <div className="mb-4 text-center sm:mb-5">
          <p className="text-xl font-bold text-emerald-600">Reset Password</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 sm:space-y-4"
        >
          <div>
            <label className="block !text-sm font-medium text-gray-700 mb-1">
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
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>Submit</>
            )}
          </Button>
        </form>

        <div className="mt-4 flex justify-between sm:mt-6">
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
