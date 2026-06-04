import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight, Gamepad2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import duoclashImage from "@/assets/duoclash.png";

function Games() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-2">
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/games/duo-clash"
          className={cn(
            "group block overflow-hidden rounded-[1.75rem] border bg-white/90 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 dark:bg-white/5",
            "border-emerald-100 hover:border-emerald-200 dark:border-emerald-900/40",
          )}
        >
          <div className="relative min-h-[240px] p-4 sm:p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.24),transparent)]" />
            <div className="relative flex h-full flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">
                    Current game
                  </Badge>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                      DuoClash
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tap to open the game page.
                    </p>
                  </div>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600">
                  <Gamepad2 className="h-5 w-5" />
                </div>
              </div>

              <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-muted-foreground">
                    Choose computer mode or select a user after the game opens.
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Open game
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                <div className="h-24 w-24 overflow-hidden ">
                  <img
                    src={duoclashImage}
                    alt="Rock Paper Scissors illustration"
                    className="h-full w-full rounded-2xl object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Card className="overflow-hidden rounded-[1.75rem] border border-dashed border-emerald-200 bg-white/75 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-white/5">
          <div className="flex h-full min-h-[240px] flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-emerald-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  More games yet to come
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We&apos;re keeping this space ready for the next simple game.
                </p>
              </div>
            </div>

            <Badge variant="outline" className="w-fit rounded-full">
              Coming soon
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Games;
