import { extractLocationMarker } from "@/lib/location";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function PostContent({ text, className }) {
  const { text: cleanText, location } = extractLocationMarker(text || "");

  const renderContent = (content) => {
    return content.split(/(\s+)/).map((word, index) => {
      const isHashtag = word.startsWith("#") && word.length > 1;

      if (isHashtag) {
        const tag = word.replace(/[^\w#]/g, "");

        return (
          <Link
            key={index}
            to={`/hashtags/${tag.replace("#", "").toLowerCase()}`}
            className="
  font-medium
  text-blue-600
  transition-colors
  duration-200
  hover:text-blue-700
  dark:text-blue-400
  dark:hover:text-blue-300
"
          >
            {word}
          </Link>
        );
      }

      return <span key={index}>{word}</span>;
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {cleanText ? (
        <p
          className="
            whitespace-pre-wrap
            break-words
            text-sm
            leading-relaxed
            text-foreground
            sm:text-base
          "
        >
          {renderContent(cleanText)}
        </p>
      ) : null}

      {location?.name && location?.url ? (
        <a
          href={location.url}
          target="_blank"
          rel="noreferrer"
          className="
            inline-flex
            max-w-full
            items-center
            gap-1
            text-xs
            font-medium
            text-blue-600
            transition-colors
            hover:text-blue-700
            hover:underline
            sm:text-sm
            dark:text-blue-400
            dark:hover:text-blue-300
          "
        >
          <MapPin className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />

          <span className="min-w-0 break-words">{location.name}</span>
        </a>
      ) : null}
    </div>
  );
}
