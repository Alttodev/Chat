import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {  Play, Pause, Check, Loader2, Music } from "lucide-react";
import { useSongs } from "@/hooks/useSongHook";

export function MusicPickerModal({
  open,
  onOpenChange,
  onSelect,
  selectedSongId,
}) {
  const [previewingId, setPreviewingId] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: songs = [], isLoading, isError } = useSongs(debouncedSearch);

  const togglePreview = (song) => {
    if (previewingId === song.id) {
      audioRef.current?.pause();
      setPreviewingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = song.src;
        audioRef.current.play().catch(() => {});
      }
      setPreviewingId(song.id);
    }
  };

  useEffect(() => {
    if (!open) {
      audioRef.current?.pause();
      setPreviewingId(null);
      setSearch("");
    }
  }, [open]);

  const handleSelect = (song) => {
    audioRef.current?.pause();
    setPreviewingId(null);
    onSelect(song);
    onOpenChange(false);
  };

  // Format seconds → "3:45"
  const formatDuration = (secs) => {
    if (!secs) return "";
    const m = Math.floor(secs / 60);
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <audio ref={audioRef} onEnded={() => setPreviewingId(null)} />

      <DialogContent className="w-[calc(100%-2rem)] max-w-[420px] rounded-xl p-0  [&_button]:cursor-pointer overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3  px-4 py-3">
          <DialogTitle className="flex-1 flex items-center text-base font-semibold text-foreground">
            Choose Background Song
          </DialogTitle>
        </div>

        {/* Search */}
        <div className="px-4  pb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs or artists…"
            className="w-full rounded-full border border-border bg-muted/40 px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
          />
        </div>

        {/* Song list */}
        <ul className="max-h-[55vh] overflow-y-auto px-2 pb-3 space-y-1">
          {isLoading && (
            <li className="flex items-center justify-center py-10 gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading songs…
            </li>
          )}

          {isError && (
            <li className="py-8 text-center text-sm text-red-500">
              Failed to load songs. Try again.
            </li>
          )}

          {!isLoading && !isError && songs.length === 0 && (
            <li className="py-8 text-center text-sm text-muted-foreground">
              No songs found
            </li>
          )}

          {songs.map((song) => {
            const isPreviewing = previewingId === song.id;
            const isSelected = selectedSongId === song.id;

            return (
              <li key={song.id}>
                <div
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition cursor-pointer
                    ${isSelected ? "bg-emerald-50 dark:bg-emerald-900/20" : "hover:bg-muted/60"}`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                    {song.cover ? (
                      <img
                        src={song.cover}
                        alt={song.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Music className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Info */}
                  <div
                    className="min-w-0 flex-1"
                    onClick={() => handleSelect(song)}
                  >
                    <p className="truncate text-sm font-medium text-foreground">
                      {song.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {song.artist}
                      {song.duration
                        ? ` · ${formatDuration(song.duration)}`
                        : ""}
                    </p>
                  </div>

                  {/* Preview button */}
                  <button
                    onClick={() => togglePreview(song)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 transition cursor-pointer"
                    aria-label={isPreviewing ? "Pause preview" : "Preview song"}
                  >
                    {isPreviewing ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
