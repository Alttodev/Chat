import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

const ProtectedRoute = () => {
  const { token, profileId } = useAuthStore();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCheckingProfile(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
         
            <LoaderCircle className="w-12 h-12 text-emerald-600 animate-spin" />
        

          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Checking Profile
            </h2>

            <p className="text-sm text-muted-foreground mt-1">
              Please wait a moment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileId) {
    return <Navigate to="/profile/create" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;