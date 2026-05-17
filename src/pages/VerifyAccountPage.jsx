import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
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
          `/verification/confirm?token=${token}`,
        );

        toastSuccess(res?.data?.message || "Account verified successfully");

        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      } catch (error) {
        toastError(error?.response?.data?.message || "Verification failed");
      }
    };

    verify();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mb-5 flex justify-center">
          <LoaderCircle className="h-12 w-12 animate-spin text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Verifying Account</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we securely verify your email.
        </p>
      </div>
    </div>
  );
};

export default VerifyAccountPage;
