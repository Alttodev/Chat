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

const renderHighlightedText = (value, placeholder) => {
  if (!value) {
    return `<span class="text-muted-foreground">${escapeHtml(placeholder || "")}</span>`;
  }

  const safeValue = escapeHtml(value);
  return safeValue.replace(
    mentionPattern,
    (_match, prefix, mention) =>
      `${prefix}<span class="text-blue-600 font-medium">${mention}</span>`,
  );
};

function MentionTextarea({
  name,
  control,
  placeholder,
  disabled,
  rules,
  className,
}) {
  const mirrorRef = useRef(null);

  useEffect(() => {
    if (!mirrorRef.current) return;
    mirrorRef.current.scrollTop = 0;
  }, []);

  const sharedClassName = useMemo(
    () =>
      cn(
        "min-h-[60px] w-full rounded-md border border-input px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
        className,
      ),
    [className],
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
              "pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words bg-white",
            )}
          >
            <div
              className="whitespace-pre-wrap break-words text-sm sm:text-base text-foreground"
              dangerouslySetInnerHTML={{
                __html: renderHighlightedText(field.value, placeholder),
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
