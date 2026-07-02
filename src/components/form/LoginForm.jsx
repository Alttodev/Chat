import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "../form_inputs/TextInput";
import { PasswordInput } from "../form_inputs/PasswordInput";
import { loginSchema } from "@/lib/validation";
import { toastError, toastSuccess } from "@/lib/toast";
import { Button } from "../ui/button";
import ReCAPTCHA from "react-google-recaptcha";
import { useUserLogin } from "@/hooks/authHooks";
import { useAuthStore } from "@/store/authStore";
import { getProfile } from "@/api/axios";
import { useSocket } from "@/lib/socket";
import logo from "@/assets/logo.png";
import { Loader2 } from "lucide-react";
import GoogleIcon from "@/lib/googleSvg";

const MOBILE_FOLLOW_SUGGESTIONS_HIDDEN_KEY = "mobile-follow-suggestions-hidden";

const LoginForm = () => {
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_GOOGLE_CAPTCHA_SITE_KEY;
  const navigate = useNavigate();
  const { mutateAsync: userLogin } = useUserLogin();
  const { setToken, setUser, setProfileId } = useAuthStore();
  const [googleLoading, setGoogleLoading] = useState(false);
  const { connectSocket } = useSocket();
  const captchaRef = useRef(null);

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
      const res = await userLogin(data);
      setToken(res?.token);
      setUser(res?.user);
      connectSocket(res?.user?._id);
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
            userName: resp?.profile?.userName || res?.user?.userName || "there",
          }),
        );
        navigate("/home");
      } else {
        setProfileId(null);
        navigate("/profile/create");
      }

      captchaRef.current?.reset();
      setValue("captcha", "");
    } catch (error) {
      captchaRef.current?.reset();
      setValue("captcha", "");
      if (error?.response?.data?.message === "Profile not found") {
        setProfileId(null);
        navigate("/profile/create");
      } else {
        toastError(error?.response?.data?.message || "Something went wrong");
      }
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = `${import.meta.env.VITE_APP_API_URL}/auth/google`;
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
          <p className="text-xl font-bold text-gray-800">
            Welcome to <span className="text-emerald-600">Clix</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Connect, share, and explore
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 sm:space-y-4"
        >
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

          <div>
            <ReCAPTCHA
              ref={captchaRef}
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
            className="
              w-full h-11 rounded-full
              bg-emerald-600 hover:bg-emerald-700
              text-white font-medium text-sm
              shadow-sm hover:shadow-md
              transition-all duration-200 active:scale-[0.98]
              cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3 sm:my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="
    w-full h-11 rounded-full
    flex items-center justify-center gap-2
    border border-gray-200 bg-white
    text-sm font-medium text-gray-700
    shadow-sm hover:shadow-md hover:bg-gray-50
    transition-all duration-200 active:scale-[0.98]
    cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed
  "
        >
          {googleLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-gray-600 sm:mt-6">
          Don't have an account?{" "}
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
