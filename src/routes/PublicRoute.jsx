import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const PublicRoute = () => {
  const { token, profileId } = useAuthStore();
  const location = useLocation();

  const allowedPublicPaths = [
    "/profile/create",
    "/verify-account",
    "/reset-password",
    "/reset",
  ];

  if (token && profileId && !allowedPublicPaths.includes(location.pathname)) {
    return <Navigate to="/home" replace />;
  }

  // if (token && !profileId && location.pathname !== "/profile/create") {
  //   return <Navigate to="/profile/create" replace />;
  // }
  if (token && profileId === null && location.pathname === "/profile/create") {
    return <Outlet />;
  }

  return <Outlet />;
};

export default PublicRoute;
