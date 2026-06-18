import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isVideoMediaUrl } from "@/lib/media";
import { Button } from "../ui/button";
import { Loader2, Music, X } from "lucide-react";
import { MusicPickerModal } from "./musicPickerModal";

export function StatusDraftModal({
  open,
  onOpenChange,
  file,
  onPost,
  isUploading = false,
}) {
  const [caption, setCaption] = useState("");
  const [selectedSong, setSelectedSong] = useState(null);
  const [musicModalOpen, setMusicModalOpen] = useState(false);

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  const isVideo = file
    ? isVideoMediaUrl(file?.name || "") || file?.type === "video/mp4"
    : false;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!open) {
      setCaption("");
      setSelectedSong(null);
    }
  }, [open]);

  if (!file) return null;

  const handlePost = () => {
    onPost?.({ caption: caption.trim(), backgroundSong: selectedSong ?? null });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="
            w-[calc(100%-2rem)]
            max-w-[650px]
            rounded-lg
            p-4
            sm:rounded-xl
            [&_button]:cursor-pointer
          "
        >
          <DialogHeader className="px-4 py-4 sm:px-6">
            <DialogTitle className="text-emerald-600 flex justify-center">
              Add Story
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[calc(92vh-72px)] overflow-y-auto p-4 sm:max-h-[calc(88vh-72px)] sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              {/* Media preview */}
              <div className="w-full shrink-0 md:w-1/2">
                <div className="flex h-[35vh] w-full items-center justify-center overflow-hidden rounded-2xl sm:h-[50vh] md:h-[60vh]">
                  {isVideo ? (
                    <video
                      src={previewUrl}
                      controls
                      playsInline
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Selected status preview"
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Right panel */}
              <div className="min-w-0 flex-1 flex flex-col gap-4">
                {/* Caption */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Caption
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    rows={4}
                    className="min-h-[50px] w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Background song — images only */}
                {!isVideo && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Background Song
                    </label>

                    {selectedSong ? (
                      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 px-3 py-2.5">
                        {/* <span className="text-2xl">{selectedSong.cover}</span> */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {selectedSong.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {selectedSong.artist}
                          </p>
                        </div>
                        <button
                          onClick={() => setMusicModalOpen(true)}
                          className="shrink-0 text-xs text-emerald-600  cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          onClick={() => setSelectedSong(null)}
                          className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted transition cursor-pointer"
                          aria-label="Remove song"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setMusicModalOpen(true)}
                        className="flex w-full items-center gap-2.5 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 transition cursor-pointer"
                      >
                        <Music className="h-4 w-4 shrink-0" />
                        <span>Add background music</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Post button */}
                <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    type="button"
                    onClick={handlePost}
                    disabled={isUploading}
                    className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Story"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MusicPickerModal
        open={musicModalOpen}
        onOpenChange={setMusicModalOpen}
        onSelect={setSelectedSong}
        selectedSongId={selectedSong?.id}
      />
    </>
  );
}
