import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RockPaperScissors from "@/components/games/RockPaperScissors";

function RockPaperScissorsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-2">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">
            Current game
          </Badge>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            DuoClash
          </h1>
          <p className="text-sm text-muted-foreground">
            10-point match. The player with the most points at 10 wins.
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
        >
          <Link to="/games">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <RockPaperScissors />
    </div>
  );
}

export default RockPaperScissorsPage;
