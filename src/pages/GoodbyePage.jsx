import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export default function GoodbyePage() {
  const navigate = useNavigate();
  const { resetAuth } = useAuthStore();

  useEffect(() => {
    resetAuth();
    localStorage.clear();

    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate, resetAuth]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background Blur */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/10" />
      </div>

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200/70 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30">
          <Heart className="h-10 w-10 fill-pink-500 text-pink-500" />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white">
          We'll miss you!
        </h1>

        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          Your account has been deleted successfully.
          <br />
          Thank you for being part of our community.
        </p>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          We hope to see you again someday. 💙
        </p>

        <div className="mt-8">
          <Button  variant="outline" asChild  className="h-12 rounded-full text-foreground hover:bg-accent hover:text-accent-foreground px-6">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Login
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
          Redirecting to login in a few seconds...
        </p>
      </div>
    </div>
  );
}