import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toastError, toastSuccess } from "@/lib/toast";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

/**
 * Route: /auth/google/success
 * The backend redirects here after a successful Google OAuth login.
 * It reads ?token=...&user=... from the URL, stores them, and redirects to /home.
 */
const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const userRaw = searchParams.get("user");

    if (!token || !userRaw) {
      toastError("Google login failed. Please try again.");
      navigate("/", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));

      // Persist token + user in your auth store (same shape as normal login)
      setAuth({ token, user });

      toastSuccess("Logged in with Google!");
      navigate("/home", { replace: true });
    } catch {
      toastError("Something went wrong. Please try again.");
      navigate("/", { replace: true });
    }
  }, [navigate, searchParams, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="text-emerald-600" size={44} />
    </div>
  );
};

export default GoogleAuthSuccess;