import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toastSuccess, toastError } from "@/lib/toast";
import axiosInstance from "@/api/axiosInstance";

const VerifyAccountPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verify = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          toastError("Invalid verification link");
          return;
        }

        const res = await axiosInstance.get(
          `/verification/confirm?token=${token}`
        );

        toastSuccess(res?.data?.message || "Account verified successfully");

        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      } catch (error) {
        toastError(
          error?.response?.data?.message || "Verification failed"
        );
      }
    };

    verify();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-card border rounded-2xl p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold">Verifying Account...</h1>
        <p className="text-muted-foreground mt-2">
          Please wait while we verify your email.
        </p>
      </div>
    </div>
  );
};

export default VerifyAccountPage;