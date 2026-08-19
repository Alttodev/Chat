import { usePollVote } from "@/hooks/pollHooks";

export default function PollOptionsBlock({ post: initialPost }) {
  const { post, voting, error, vote } = usePollVote(
    initialPost._id,
    initialPost
  );

  const hasVoted = Boolean(post.myVoteOptionId);
  const options = post.pollOptions || [];

  return (
    <div className="mt-2 space-y-2">
      {options.map((option) => {
        const percent =
          post.totalVotes > 0
            ? Math.round((option.votes / post.totalVotes) * 100)
            : 0;
        const isMine = post.myVoteOptionId === option._id;

        if (!hasVoted) {
          return (
            <button
              key={option._id}
              onClick={() => vote(option._id)}
              disabled={voting}
              className="w-full rounded-xl border border-border/60 bg-white px-4 py-3 text-left text-sm font-medium text-foreground transition hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-60"
            >
              {option.text}
            </button>
          );
        }

        return (
          <div
            key={option._id}
            className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-white px-4 py-3"
          >
            <div
              className={`absolute inset-y-0 left-0 rounded-xl transition-all duration-500 ${
                isMine ? "bg-emerald-100" : "bg-muted"
              }`}
              style={{ width: `${percent}%` }}
            />
            <div className="relative flex items-center justify-between text-sm">
              <span
                className={`font-medium ${
                  isMine ? "text-emerald-700" : "text-foreground"
                }`}
              >
                {option.text} {isMine && "✓"}
              </span>
              <span className="text-muted-foreground">{percent}%</span>
            </div>
          </div>
        );
      })}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* <p className="text-xs text-muted-foreground">
        {post.totalVotes} vote{post.totalVotes !== 1 ? "s" : ""}
      </p> */}
    </div>
  );
}