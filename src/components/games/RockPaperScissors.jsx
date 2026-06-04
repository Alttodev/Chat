import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUserDetail } from "@/hooks/authHooks";
import { useSearchUsers } from "@/hooks/searchHooks";
import { useSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { toastError, toastSuccess, toastWarning } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import RockPaperScissorsCelebration from "@/components/games/RockPaperScissorsCelebration";
import { submitPuzzleResult } from "@/api/axios";
import duoclashImage from "@/assets/duoclash.png";
import {
  Bot,
  Check,
  Hand,
  RotateCcw,
  Scissors,
  Search,
  Send,
  Trophy,
  Users,
  X,
} from "lucide-react";

const WIN_LIMIT = 10;

const CHOICES = [
  {
    key: "rock",
    label: "Rock",
    icon: Hand,
    iconClassName: "",
    tone: "from-slate-700 to-slate-900",
  },
  {
    key: "paper",
    label: "Paper",
    icon: Hand,
    iconClassName: "-rotate-90 scale-x-[-1]",
    tone: "from-emerald-500 to-teal-600",
  },
  {
    key: "scissors",
    label: "Scissors",
    icon: Scissors,
    iconClassName: "",
    tone: "from-amber-500 to-orange-600",
  },
];

const WIN_MAP = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

const randomChoice = () =>
  CHOICES[Math.floor(Math.random() * CHOICES.length)]?.key || "rock";

const getProfileId = (profile) =>
  String(profile?.id ?? profile?._id ?? profile?.userId ?? "");

function ResultBadge({ mode, result, selectedOpponent, matchWinner, limit }) {
  if (mode === "user") {
    return (
      <Badge className="rounded-full bg-sky-500/15 px-4 py-1.5 text-sm font-semibold text-sky-700 dark:text-sky-300 hover:bg-transparent">
        {selectedOpponent ? "User selected" : "Pick a user"}
      </Badge>
    );
  }

  const config = {
    win: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    lose: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    tie: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    ready: "bg-muted text-muted-foreground",
  };

  if (matchWinner) {
    return (
      <Badge className="rounded-full bg-emerald-500/15 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
        Match complete
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-semibold",
        config[result] || config.ready,
      )}
    >
      {result === "win"
        ? "You win"
        : result === "lose"
          ? "Computer wins"
          : result === "tie"
            ? "It is a tie"
            : `First to ${limit} wins`}
    </Badge>
  );
}

function ChoiceCard({ title, choice, isActive, isWinner }) {
  const selected = CHOICES.find((item) => item.key === choice);
  const Icon = selected?.icon || Hand;

  return (
    <div
      className={cn(
        "flex min-h-[150px] flex-col items-center justify-center rounded-[1.5rem] border bg-white/85 p-4 text-center shadow-sm backdrop-blur dark:bg-white/5",
        isActive
          ? "border-emerald-200 dark:border-emerald-900/60"
          : "border-border",
        isWinner && "ring-2 ring-emerald-500/40",
      )}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-all duration-300",
          selected?.tone || "from-slate-700 to-slate-900",
          isActive && "scale-105",
        )}
      >
        <Icon className={cn("h-7 w-7", selected?.iconClassName)} />
      </div>
      <p className="mt-3 text-sm font-bold text-foreground">
        {selected?.label || "Waiting"}
      </p>
    </div>
  );
}

function RockPaperScissors() {
  const { data: profileData } = useUserDetail();
  const { socket } = useSocket();
  const storedUser = useAuthStore((state) => state.user);

  const currentUser = profileData?.profile || storedUser || {};
  const currentUserId = getProfileId(currentUser);
  const currentUserName = currentUser?.userName || "You";

  const [mode, setMode] = useState("computer");
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState("ready");
  const [playerWins, setPlayerWins] = useState(0);
  const [computerWins, setComputerWins] = useState(0);
  const [ties, setTies] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [matchWinner, setMatchWinner] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const matchStartRef = useRef(null);
  const hasSubmittedRef = useRef(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchValue.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mode !== "user") {
      setIsInviteOpen(false);
    }
  }, [mode]);

  useEffect(() => {
    if (!isInviteOpen) {
      setSearchValue("");
      setDebouncedQuery("");
      setIsSending(false);
    }
  }, [isInviteOpen]);

  const { data: searchResults, isFetching } = useSearchUsers(
    debouncedQuery,
    isInviteOpen && mode === "user",
  );

  const players = useMemo(() => {
    const profilesSource =
      searchResults?.profiles ?? searchResults?.users ?? searchResults?.data;
    const profiles = Array.isArray(profilesSource) ? profilesSource : [];

    return profiles.filter((user) => {
      const userId = getProfileId(user);
      return userId && userId !== currentUserId;
    });
  }, [currentUserId, searchResults]);

  const isWinner = useMemo(() => {
    if (result === "win") return "player";
    if (result === "lose") return "computer";
    return null;
  }, [result]);

  const resetComputerGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult("ready");
    setPlayerWins(0);
    setComputerWins(0);
    setTies(0);
    setRoundsPlayed(0);
    setMatchWinner(null);
    setIsPlaying(false);
    matchStartRef.current = null;
    hasSubmittedRef.current = false;
    // remove persisted score for current user so reset clears persisted value as well
    try {
      if (currentUserId) {
        localStorage.removeItem(`rps-score-${currentUserId}`);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // ignore
    }
  };

  // Persist/load scores per-user so refresh keeps the score, but reset or logout can clear it.
  useEffect(() => {
    // load saved scores when user changes
    if (!currentUserId) return;
    try {
      const raw = localStorage.getItem(`rps-score-${currentUserId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPlayerWins(parsed.playerWins || 0);
        setComputerWins(parsed.computerWins || 0);
        setTies(parsed.ties || 0);
        setRoundsPlayed(parsed.roundsPlayed || 0);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // ignore parse errors
    }
  }, [currentUserId]);

  useEffect(() => {
    // save whenever scores change
    if (!currentUserId) return;
    try {
      const payload = { playerWins, computerWins, ties, roundsPlayed };
      localStorage.setItem(
        `rps-score-${currentUserId}`,
        JSON.stringify(payload),
      );
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // ignore quota errors
    }
  }, [currentUserId, playerWins, computerWins, ties, roundsPlayed]);

  const playRound = (choice) => {
    if (isPlaying || matchWinner) return;

    if (!matchStartRef.current) {
      matchStartRef.current = Date.now();
    }

    const computerPick = randomChoice();
    setPlayerChoice(choice);
    setComputerChoice(computerPick);
    setIsPlaying(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      let nextResult = "tie";

      if (choice !== computerPick) {
        nextResult = WIN_MAP[choice] === computerPick ? "win" : "lose";
      }

      const nextPlayerWins = playerWins + (nextResult === "win" ? 1 : 0);
      const nextComputerWins = computerWins + (nextResult === "lose" ? 1 : 0);
      const nextTies = ties + (nextResult === "tie" ? 1 : 0);
      const nextRoundsPlayed = roundsPlayed + 1;

      setResult(nextResult);
      setPlayerWins(nextPlayerWins);
      setComputerWins(nextComputerWins);
      setTies(nextTies);
      setRoundsPlayed(nextRoundsPlayed);
      if (nextPlayerWins >= WIN_LIMIT || nextComputerWins >= WIN_LIMIT) {
        setMatchWinner(
          nextPlayerWins > nextComputerWins ? "player" : "computer",
        );

        // submit result for current user (send player's score and duration)
        if (currentUserId && !hasSubmittedRef.current) {
          const submit = async () => {
            try {
              const timeMs = matchStartRef.current
                ? Date.now() - matchStartRef.current
                : 0;
              await submitPuzzleResult({
                userId: currentUserId,
                puzzleId: "rps",
                score: nextPlayerWins,
                timeMs,
              });
              toastSuccess("Game result submitted");
            } catch (error) {
              console.error("Failed to submit puzzle result:", error);
              toastError("Failed to submit game result");
            }
          };

          hasSubmittedRef.current = true;
          void submit();
        }
      }
      setIsPlaying(false);
      timeoutRef.current = null;
    }, 500);
  };

  const handleSendInvite = async () => {
    if (!selectedOpponent) {
      toastWarning("Please pick a user.");
      return;
    }

    if (!currentUserId) {
      toastError("We could not identify your account.");
      return;
    }

    const opponentId = getProfileId(selectedOpponent);
    if (!opponentId) {
      toastError("The selected player is missing an id.");
      return;
    }

    if (!socket?.connected) {
      toastWarning("You need to be connected before sending a request.");
      return;
    }

    const roomId = `rps-${[currentUserId, opponentId].map(String).sort().join("-")}`;

    try {
      setIsSending(true);
      socket.emit("game:rps:invite", {
        game: "rock-paper-scissors",
        roomId,
        fromUserId: currentUserId,
        fromUserName: currentUserName,
        toUserId: opponentId,
        toUserName: selectedOpponent?.userName || "Player",
      });
      toastSuccess(
        `Play request sent to ${selectedOpponent?.userName || "player"}.`,
      );
      setIsInviteOpen(false);
    } catch (error) {
      toastError(error?.message || "Failed to send the play request.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <CardHeader className="relative overflow-hidden px-6 py-6 text-white sm:px-8">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35"
              style={{ backgroundImage: `url(${duoclashImage})` }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.38),transparent_30%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_28%),linear-gradient(180deg,rgba(7,26,22,0.78)_0%,rgba(15,60,49,0.72)_48%,rgba(15,23,42,0.86)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_25%,transparent_70%,rgba(255,255,255,0.05))]" />
          </div>
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15">
                Entertainment
              </Badge>
              <CardTitle className="flex items-center gap-2 text-3xl font-black">
                <Trophy className="h-7 w-7" />
                DuoClash
              </CardTitle>
              <p className="max-w-xl text-sm leading-7 text-emerald-50/90 sm:text-base">
                Choose computer play or challenge a user with a clean, simple
                flow.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-5 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => {
                setMode("computer");
                setIsInviteOpen(false);
                setSearchValue("");
                setDebouncedQuery("");
              }}
              className={cn(
                "h-11 rounded-full border border-white/20 px-5 text-sm font-medium shadow-lg backdrop-blur-sm transition-all cursor-pointer",
                mode === "computer"
                  ? "bg-white text-emerald-700 hover:bg-white"
                  : "bg-white/15 text-white hover:bg-white/25",
              )}
            >
              <Bot className="mr-2 h-4 w-4" />
              Computer
            </Button>
            <Button
              type="button"
              onClick={() => {
                setMode("user");
                setMatchWinner(null);
                setResult("ready");
                setPlayerChoice(null);
                setComputerChoice(null);
                setIsInviteOpen(true);
              }}
              className={cn(
                "h-11 rounded-full border border-white/20 px-5 text-sm font-medium shadow-lg backdrop-blur-sm transition-all cursor-pointer",
                mode === "user"
                  ? "bg-white text-emerald-700 hover:bg-white"
                  : "bg-white/15 text-white hover:bg-white/25",
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              Select user
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 bg-[linear-gradient(180deg,#f8fffb_0%,#f5fbf8_100%)] p-6 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.96)_0%,rgba(8,15,26,0.98)_100%)] sm:p-8">
          {mode === "computer" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-3xl border border-emerald-100 bg-white/85 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Your wins
                  </p>
                  <p className="mt-2 text-3xl font-black text-emerald-600">
                    {playerWins}
                  </p>
                </div>
                <div className="rounded-3xl border border-emerald-100 bg-white/85 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Computer wins
                  </p>
                  <p className="mt-2 text-3xl font-black text-emerald-600">
                    {computerWins}
                  </p>
                </div>
                <div className="rounded-3xl border border-emerald-100 bg-white/85 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Ties
                  </p>
                  <p className="mt-2 text-3xl font-black text-emerald-600">
                    {ties}
                  </p>
                </div>
                <div className="rounded-3xl border border-emerald-100 bg-white/85 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Win limit
                  </p>
                  <p className="mt-2 text-3xl font-black text-emerald-600">
                    {WIN_LIMIT}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-dashed border-emerald-200 bg-white/75 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-white/5">
                <div className="grid w-full gap-4 lg:grid-cols-2">
                  <ChoiceCard
                    title="You"
                    choice={playerChoice}
                    isActive={Boolean(playerChoice)}
                    isWinner={isWinner === "player"}
                  />
                  <ChoiceCard
                    title="Computer"
                    choice={computerChoice}
                    isActive={Boolean(computerChoice)}
                    isWinner={isWinner === "computer"}
                  />
                </div>

                <div className="w-full max-w-2xl space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {CHOICES.map((choice) => {
                      const Icon = choice.icon;

                      return (
                        <Button
                          key={choice.key}
                          type="button"
                          onClick={() => playRound(choice.key)}
                          disabled={isPlaying || Boolean(matchWinner)}
                          className={cn(
                            "h-14 rounded-2xl bg-gradient-to-r px-4 text-white shadow-lg transition-all duration-200 hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer",
                            choice.tone,
                          )}
                        >
                          <Icon
                            className={cn("mr-2 h-5 w-5", choice.iconClassName)}
                          />
                          {choice.label}
                        </Button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      Tap one move to score a point. First to 10 wins.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetComputerGame}
                      className="h-11 rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>

              <RockPaperScissorsCelebration
                open={Boolean(matchWinner)}
                outcome={matchWinner}
                limit={WIN_LIMIT}
                onPlayAgain={resetComputerGame}
                onReset={resetComputerGame}
              />
            </>
          ) : (
            <div className="space-y-4 rounded-[2rem] border border-dashed border-emerald-200 bg-white/75 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Selected user
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pick one person and send a request.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInviteOpen(true)}
                  className="h-11 rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {selectedOpponent ? "Change user" : "Choose user"}
                </Button>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border bg-emerald-50/60 p-4 dark:bg-emerald-950/20">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      className="h-full w-full object-cover object-top"
                      src={selectedOpponent?.profileImage || "/placeholder.svg"}
                    />
                    <AvatarFallback className="bg-emerald-600 text-white">
                      {selectedOpponent?.userName?.charAt(0)?.toUpperCase() ||
                        "P"}
                    </AvatarFallback>
                  </Avatar>
                  {selectedOpponent && (
                    <div className="absolute bottom-1 -right-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            selectedOpponent?.isOnline
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        ></span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {selectedOpponent?.userName || "No user selected"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {selectedOpponent
                      ? selectedOpponent?.address || "Ready to send request"
                      : "Choose someone from the picker"}
                  </p>
                </div>
                {selectedOpponent ? (
                  <button
                    type="button"
                    onClick={() => setSelectedOpponent(null)}
                    className="px-3 py-1.5 text-xs font-medium text-emerald-700 transition  dark:border-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-950/40 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <Button
                type="button"
                onClick={handleSendInvite}
                disabled={!selectedOpponent || isSending}
                className="h-11 rounded-full bg-emerald-600 px-5 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isSending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send request
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="max-w-xl overflow-hidden p-0 sm:rounded-3xl [&_button]:text-white">
          <DialogHeader className="border-b bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-4 text-white">
            <DialogTitle className="text-xl">Choose a user</DialogTitle>
            <DialogDescription className="text-emerald-50/85">
              Search for one person and tap them to select.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search users by name..."
                className="h-11 rounded-full border-border pl-10"
              />
            </div>

            <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
              {isFetching ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl border bg-muted/40 p-5 text-sm text-muted-foreground">
                  <Search className="h-4 w-4 animate-pulse" />
                  Searching users...
                </div>
              ) : null}

              {!isFetching && debouncedQuery && players.length === 0 ? (
                <div className="rounded-2xl border bg-muted/40 p-5 text-center text-sm text-muted-foreground">
                  No users found for "{debouncedQuery}"
                </div>
              ) : null}

              {!debouncedQuery ? (
                <div className="rounded-2xl border bg-muted/40 p-5 text-center text-sm text-muted-foreground">
                  Type a name to search.
                </div>
              ) : null}

              {players.map((user) => {
                const userId = getProfileId(user);
                const isSelected = userId === getProfileId(selectedOpponent);

                return (
                  <button
                    key={userId || user?.userName}
                    type="button"
                    onClick={() => {
                      setSelectedOpponent(user);
                      setIsInviteOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition cursor-pointer",
                      "hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20",
                      isSelected &&
                        "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30",
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-11 w-11 ">
                        <AvatarImage
                          className="h-full w-full object-cover object-top"
                          src={user?.profileImage || "/placeholder.svg"}
                        />
                        <AvatarFallback className="bg-emerald-600 text-white">
                          {user?.userName?.charAt(0)?.toUpperCase() || "P"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-1 -right-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              user?.isOnline ? "bg-green-500" : "bg-yellow-500"
                            }`}
                          ></span>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">
                          {user?.userName || "Player"}
                        </p>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {user?.address || "No location shared"}
                      </p>
                    </div>

                    {isSelected ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RockPaperScissors;
