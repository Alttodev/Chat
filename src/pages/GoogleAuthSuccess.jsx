import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toastError, toastSuccess } from "@/lib/toast";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { getProfile } from "@/api/axios";
import { useSocket } from "@/lib/socket";

const MOBILE_FOLLOW_SUGGESTIONS_HIDDEN_KEY = "mobile-follow-suggestions-hidden";

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser, setProfileId } = useAuthStore();
  const { connectSocket } = useSocket();

  useEffect(() => {
    const token = searchParams.get("token");
    const userRaw = searchParams.get("user");

    if (!token || !userRaw) {
      toastError("Google login failed. Please try again.");
      navigate("/", { replace: true });
      return;
    }

    const handleSuccess = async () => {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));

        // Set token + user — same as normal login
        setToken(token);
        setUser(user);
        connectSocket(user?._id);
        await new Promise((resolve) => setTimeout(resolve, 200));
        // Fetch profile to get profileId — same as normal login
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
              userName: resp?.profile?.userName || user?.userName || "there",
            }),
          );
          toastSuccess("Logged in with Google!");
          navigate("/home", { replace: true });
        } else {
          setProfileId(null);
          navigate("/profile/create", { replace: true });
        }
      } catch (err) {
        if (err?.response?.data?.message === "Profile not found") {
          setProfileId(null);
          navigate("/profile/create", { replace: true });
        } else {
          toastError("Something went wrong. Please try again.");
          navigate("/", { replace: true });
        }
      }
    };

    handleSuccess();
  }, [connectSocket, navigate, searchParams, setProfileId, setToken, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="text-emerald-600" size={44} />
    </div>
  );
};

export default GoogleAuthSuccess;
