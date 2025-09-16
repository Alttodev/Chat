import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "../form_inputs/TextInput";
import { PasswordInput } from "../form_inputs/PasswordInput";
import { loginSchema } from "@/lib/validation";
import { toastError, toastSuccess } from "@/lib/toast";
import { Button } from "../ui/button";
import ReCAPTCHA from "react-google-recaptcha";

const LoginForm = () => {
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_GOOGLE_CAPTCHA_SITE_KEY;
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      captcha: "",
    },
  });

  const handleCaptchaChange = (token) => {
    setValue("captcha", token || "", { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      console.log(data);
      toastSuccess("Login successful");
      navigate("/customer/create");
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
          <p className="text-xl font-bold text-gray-800">
            Welcome to <span className="text-emerald-600">Clix</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Connect, share, and explore
          </p>
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
          <div>
            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleCaptchaChange}
            />
            {errors.captcha && (
              <p className="text-red-500 text-sm">{errors.captcha.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              to="/reset"
              className="text-sm text-emerald-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg shadow-sm transition cursor-pointer text-base"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-emerald-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
