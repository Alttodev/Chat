
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const ProtectedRoute = () => {
  const { token, profileId } = useAuthStore();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (!profileId) {
    return <Navigate to="/profile/create" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
