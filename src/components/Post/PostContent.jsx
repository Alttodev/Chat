import { extractLocationMarker } from "@/lib/location";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export default function PostContent({ text, className }) {
  const { text: cleanText, location } = extractLocationMarker(text || "");

  return (
    <div className={cn("space-y-2", className)}>
      {cleanText ? (
        <p className="text-foreground leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
          {cleanText}
        </p>
      ) : null}

      {location?.name && location?.url ? (
        <a
          href={location.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{location.name}</span>
        </a>
      ) : null}
    </div>
  );
}
