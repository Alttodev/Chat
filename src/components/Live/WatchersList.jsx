// components/Live/WatchersList.jsx
import { useState } from "react";
import { useRemoteParticipants } from "@livekit/components-react";
import { X } from "lucide-react";

function parseMetadata(metadata) {
  try {
    return JSON.parse(metadata || "{}");
  } catch {
    return {};
  }
}

export default function WatchersList({ excludeIdentity }) {
  const [expanded, setExpanded] = useState(false);
  const remoteParticipants = useRemoteParticipants();

  const watchers = remoteParticipants
    .filter((p) => p.identity !== excludeIdentity)
    .map((p) => ({
      identity: p.identity,
      name: p.name || "Viewer",
      avatarUrl: parseMetadata(p.metadata).avatarUrl,
    }));

  if (watchers.length === 0) return null;

  const preview = watchers.slice(0, 3);

  return (
    <>
      <button
        onClick={() => setExpanded(true)}
        className="absolute left-4 top-12 flex items-center gap-1.5 rounded-full bg-black/50 py-1 pl-1 pr-3 backdrop-blur cursor-pointer"
      >
        <div className="flex -space-x-2">
          {preview.map((w) =>
            w.avatarUrl ? (
              <img
                key={w.identity}
                src={w.avatarUrl}
                alt=""
                className="h-6 w-6 rounded-full border border-black/50 object-cover"
              />
            ) : (
              <div
                key={w.identity}
                className="h-6 w-6 rounded-full border border-black/50 bg-white/30"
              />
            )
          )}
        </div>
        <span className="text-xs font-medium text-white">
          {watchers.length}
        </span>
      </button>

      {expanded && (
        <div className="absolute inset-0 z-20 flex flex-col bg-black/80 backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h3 className="text-sm font-semibold text-white">
              {watchers.length} watching
            </h3>
            <button
              onClick={() => setExpanded(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {watchers.map((w) => (
              <div key={w.identity} className="flex items-center gap-3">
                {w.avatarUrl ? (
                  <img
                    src={w.avatarUrl}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-white/20" />
                )}
                <span className="text-sm font-medium text-white">
                  {w.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}