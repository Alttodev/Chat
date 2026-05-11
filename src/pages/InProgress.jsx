import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Construction, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InProgress() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(180deg,_#F8FAFF_0%,_#EEF2FF_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-16 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute right-10 top-24 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-lime-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl rounded-3xl border border-white/70 bg-white/70 p-8 text-center shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-400 text-white shadow-lg">
            <Construction className="h-8 w-8" />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
            Coming Soon
          </p>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
            The page you&apos;re looking for is currently being developed.
            Please check back later.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-full px-6 shadow-lg">
              <Link to="/home">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-12 rounded-full border-slate-200 bg-white/80 px-6"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
