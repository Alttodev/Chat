import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, Sparkles, Trophy } from "lucide-react";

const OUTCOME_COPY = {
  player: {
    title: "You win",
    description: "You reached the 10-point limit first.",
    accent: "from-emerald-500 via-emerald-400 to-teal-500",
    ring: "ring-emerald-400/30",
    badge: "Winner",
  },
  computer: {
    title: "Computer wins",
    description: "The computer reached the 10-point limit first.",
    accent: "from-rose-500 via-pink-500 to-orange-500",
    ring: "ring-rose-400/30",
    badge: "Match end",
  },
  tie: {
    title: "Round tied",
    description: "Nobody reached the limit yet. Keep playing.",
    accent: "from-sky-500 via-cyan-500 to-indigo-500",
    ring: "ring-sky-400/30",
    badge: "Tie",
  },
};

const PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 7.3) % 100}%`,
  top: `${(index * 11.7) % 100}%`,
  size: 12 + (index % 4) * 5,
  delay: (index % 5) * 0.18,
  duration: 1.9 + (index % 3) * 0.35,
}));

const CONFETTI = Array.from({ length: 28 }, (_, index) => ({
  id: `confetti-${index}`,
  left: `${(index * 3.7) % 100}%`,
  top: `${8 + (index % 4) * 5}%`,
  rotate: (index * 29) % 360,
  width: 8 + (index % 3) * 3,
  height: 16 + (index % 2) * 10,
  delay: (index % 7) * 0.06,
  duration: 1.4 + (index % 4) * 0.18,
}));

const MotionDiv = motion.div;
const MotionSpan = motion.span;

function RockPaperScissorsCelebration({
  open,
  outcome,
  onPlayAgain,
  onReset,
}) {
  const copy = OUTCOME_COPY[outcome] || OUTCOME_COPY.tie;
  const title = copy.title;

  return (
    <AnimatePresence>
      {open ? (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
        >
          <MotionDiv
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.16),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.15),rgba(2,6,23,0.35))]"
          />

          {CONFETTI.map((piece) => (
            <MotionSpan
              key={piece.id}
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute rounded-sm shadow-[0_0_16px_rgba(255,255,255,0.35)]",
                piece.id.endsWith("0") && "bg-emerald-300/90",
                piece.id.endsWith("1") && "bg-sky-300/90",
                piece.id.endsWith("2") && "bg-amber-200/90",
                !piece.id.endsWith("0") &&
                  !piece.id.endsWith("1") &&
                  !piece.id.endsWith("2") &&
                  "bg-white/90",
              )}
              style={{
                left: piece.left,
                top: piece.top,
                width: piece.width,
                height: piece.height,
              }}
              initial={{ opacity: 0, y: -40, scale: 0.8, rotate: piece.rotate }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [-40, 120, 280],
                x: [0, (piece.id % 2 === 0 ? 1 : -1) * 25, 0],
                rotate: [piece.rotate, piece.rotate + 140, piece.rotate + 260],
              }}
              transition={{
                delay: piece.delay,
                duration: piece.duration,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 0.6,
                ease: "easeOut",
              }}
            />
          ))}

          {PARTICLES.map((particle) => (
            <MotionSpan
              key={particle.id}
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute rounded-full bg-white/80 shadow-[0_0_24px_rgba(255,255,255,0.45)]",
                particle.id % 3 === 0 && "bg-emerald-300/90",
                particle.id % 3 === 1 && "bg-sky-300/90",
                particle.id % 3 === 2 && "bg-amber-200/90",
              )}
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
              }}
              initial={{ opacity: 0, scale: 0.4, y: 0 }}
              animate={{
                opacity: [0, 1, 0.8, 0],
                y: [-10, -80, -150],
                scale: [0.4, 1.1, 0.7],
                rotate: [0, 180, 320],
              }}
              transition={{
                delay: particle.delay,
                duration: particle.duration,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 0.7,
                ease: "easeOut",
              }}
            />
          ))}

          <MotionDiv
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 18, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 16 }}
            className={cn(
              "relative w-full max-w-3xl overflow-hidden rounded-[2rem] border bg-white/92 p-6 shadow-[0_35px_120px_-35px_rgba(15,23,42,0.85)] backdrop-blur-xl dark:bg-slate-950/95 sm:p-8",
              copy.ring,
            )}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_28%)]" />

            <div className="relative flex flex-col gap-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <MotionDiv
                    animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.08, 1] }}
                    transition={{
                      duration: 2.4,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className={cn(
                      "flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br text-white shadow-lg",
                      copy.accent,
                    )}
                  >
                    <Trophy className="h-8 w-8" />
                  </MotionDiv>

                  <div className="min-w-0 space-y-2">
                    <Badge className="rounded-full bg-foreground text-background hover:bg-foreground">
                      {copy.badge}
                    </Badge>
                    <h2 className="text-3xl font-black tracking-tight text-foreground">
                      {title}
                    </h2>
                    <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                      {copy.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  onClick={onPlayAgain}
                  className={cn(
                    "h-10 rounded-full bg-gradient-to-r px-6 text-white shadow-lg hover:shadow-xl cursor-pointer",
                    copy.accent,
                  )}
                >
                
                  Play again
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onReset}
                  className="h-10 rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-950/40 cursor-pointer"
                >
                  
                  Reset match
                </Button>
              </div>
            </div>
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  );
}

export default RockPaperScissorsCelebration;
