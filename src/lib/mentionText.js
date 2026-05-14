const mentionPattern = /(^|[\s([{'"`~])(@[a-zA-Z0-9_.-]+)/g;

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

export const renderMentionText = (value) => {
  const safeValue = escapeHtml(value || "");

  return safeValue.replace(
    mentionPattern,
    (_match, prefix, mention) =>
      `${prefix}<span class="font-medium text-blue-600 dark:text-blue-300">${mention}</span>`,
  );
};
