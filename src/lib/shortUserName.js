export const formatShortUsername = (username, maxLength = 18) => {
  if (!username) return "someone";

  const normalized = String(username).trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) return normalized;

  const words = normalized.split(" ");
  if (words.length > 1) {
    const shortWords = words.slice(0, 2).join(" ");
    if (shortWords.length <= maxLength) {
      return `${shortWords}...`;
    }
  }

  return `${normalized.slice(0, maxLength)}...`;
};