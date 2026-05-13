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
          className="inline-flex max-w-full items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline sm:text-sm dark:text-blue-400 dark:hover:text-blue-300"
        >
          <MapPin className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
          <span className="min-w-0 break-words">{location.name}</span>
        </a>
      ) : null}
    </div>
  );
}
