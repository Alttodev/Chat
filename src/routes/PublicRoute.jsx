import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const PublicRoute = () => {
  const { token, profileId } = useAuthStore();
  const location = useLocation();

  if (token && profileId && location.pathname !== "/profile/create") {
    return <Navigate to="/home" replace />;
  }

  if (token && !profileId && location.pathname !== "/profile/create") {
    return <Navigate to="/profile/create" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
