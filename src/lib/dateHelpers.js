import dayjs from "dayjs";

/**
 * Format a date to show "Today" if same day, else formatted string.
 */
export const formatDate = (date) => {
  if (!date) return "";
  return dayjs(date).isSame(dayjs(), "day")
    ? "Today"
    : dayjs(date).format("MMM D, YYYY");
};

/**
 * Format date with relative time like "2 days ago".
 */
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const formatRelative = (date) => {
  if (!date) return "";
  return dayjs(date).fromNow();
};
