import React, { useRef } from "react";
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
import messageBg from "@/assets/bgwallpaper.png";
import { Loader2 } from "lucide-react";

const MOBILE_FOLLOW_SUGGESTIONS_HIDDEN_KEY = "mobile-follow-suggestions-hidden";

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const LoginForm = () => {
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_GOOGLE_CAPTCHA_SITE_KEY;
  const navigate = useNavigate();
  const { mutateAsync: userLogin } = useUserLogin();
  const { setToken, setUser, setProfileId } = useAuthStore();
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
    window.location.href = `${import.meta.env.VITE_APP_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex justify-center md:items-center bg-gray-50 px-4 pt-6 pb-6 md:py-0">
      <div
        className="absolute z-0 inset-0 bg-cover bg-center bg-no-repeat opacity-[0.56]"
        style={{ backgroundImage: `url(${messageBg})` }}
      />
      <div className="relative z-0 w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <img src={logo} alt="Clix Logo" className="w-12 h-12" />
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
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="
            w-full h-11 rounded-full
            flex items-center justify-center gap-2
            border border-gray-200 bg-white
            text-sm font-medium text-gray-700
            shadow-sm hover:shadow-md hover:bg-gray-50
            transition-all duration-200 active:scale-[0.98]
            cursor-pointer
          "
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
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
