

export function PostGridSkeleton({ count = 9 }) {
  return (
    <div className="grid grid-cols-3 gap-[2px]">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative aspect-square w-full overflow-hidden bg-muted animate-pulse"
        />
      ))}
    </div>
  );
}