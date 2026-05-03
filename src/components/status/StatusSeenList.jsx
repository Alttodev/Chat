import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "@/lib/dateHelpers";
import { cn } from "@/lib/utils";

const StatusSeenList = ({ seenBy = [], show, onClose }) => {

  return (
    <>
      {/* Overlay */}
      {show && (
        <div onClick={onClose} className="absolute inset-0 bg-black/40 z-40" />
      )}

      {/* Bottom Sheet */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-50 transition-transform duration-300",
          show ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="bg-black/90 backdrop-blur-lg rounded-t-3xl px-4 pt-3 pb-5 max-h-[300px] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">
              Seen by {seenBy.length}
            </p>
          </div>

          {/* List */}
          {seenBy.length === 0 ? (
            <p className="text-center text-white/60 text-sm py-6">
              No views yet
            </p>
          ) : (
            seenBy.map((viewer) => (
              <div
                key={viewer._id || viewer.user?._id}
                className="flex items-center gap-3 py-2 border-b border-white/10 last:border-none"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={viewer.user?.profileImage} />
                  <AvatarFallback>
                    {viewer.user?.userName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <p className="text-sm text-white">
                    {viewer.user?.userName || "Unknown"}
                  </p>

                  <p className="text-xs text-white/60">
                    {formatRelative(viewer.seenAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default StatusSeenList;
