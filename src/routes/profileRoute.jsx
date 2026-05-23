import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const ProfileRoute = () => {
  const { token, profileId } = useAuthStore();

  // not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // already has profile -> redirect home
  if (profileId) {
    return <Navigate to="/home" replace />;
  }

  // allow create profile page
  return <Outlet />;
};

export default ProfileRoute;