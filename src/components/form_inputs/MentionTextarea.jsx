import React, { useEffect, useMemo, useRef } from "react";
import { Controller } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";

const mentionPattern = /(^|[\s([{'"`~])(@[a-zA-Z0-9_.-]+)/g;

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const renderHighlightedText = (
  value,
  placeholder,
  { placeholderClassName, highlightClassName },
) => {
  if (!value) {
    return `<span class="${placeholderClassName}">${escapeHtml(placeholder || "")}</span>`;
  }

  const safeValue = escapeHtml(value);
  return safeValue.replace(
    mentionPattern,
    (_match, prefix, mention) =>
      `${prefix}<span class="${highlightClassName}">${mention}</span>`,
  );
};

function MentionTextarea({
  name,
  control,
  placeholder,
  disabled,
  rules,
  className,
  mirrorClassName,
  mirrorTextClassName,
  placeholderClassName = "text-muted-foreground",
  highlightClassName = "font-medium text-blue-600 dark:text-blue-300",
}) {
  const mirrorRef = useRef(null);

  useEffect(() => {
    if (!mirrorRef.current) return;
    mirrorRef.current.scrollTop = 0;
  }, []);

  const textMetricsClass = "text-base md:text-sm leading-6";
  const sharedClassName = useMemo(
    () =>
      cn(
        `min-h-[60px] w-full rounded-md border border-input px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none ${textMetricsClass}`,
        className,
      ),
    [className, textMetricsClass],
  );

  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({ field }) => (
        <div className="relative">
          <div
            ref={mirrorRef}
            aria-hidden="true"
            className={cn(
              sharedClassName,
              "pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words bg-background text-foreground",
              mirrorClassName,
            )}
          >
            <div
              className={cn(
                "whitespace-pre-wrap break-words text-foreground",
                mirrorTextClassName,
                textMetricsClass,
              )}
              dangerouslySetInnerHTML={{
                __html: renderHighlightedText(field.value, placeholder, {
                  placeholderClassName,
                  highlightClassName,
                }),
              }}
            />
          </div>
          <Textarea
            {...field}
            className={cn(
              sharedClassName,
              "relative z-10 bg-transparent text-transparent caret-foreground selection:bg-blue-200 selection:text-transparent",
            )}
            disabled={disabled}
            onScroll={(event) => {
              if (mirrorRef.current) {
                mirrorRef.current.scrollTop = event.currentTarget.scrollTop;
                mirrorRef.current.scrollLeft = event.currentTarget.scrollLeft;
              }
            }}
            onChange={(event) => {
              field.onChange(event);
            }}
          />
        </div>
      )}
    />
  );
}

export default MentionTextarea;
