const CLOUDINARY_VIDEO_PATH_RE = /\/video\/upload\//;
const VIDEO_FILE_EXT_RE = /\.(mp4|mov|webm|m4v)(\?.*)?$/i;
const AUDIO_FILE_EXT_RE = /\.(mp3|wav|ogg|m4a|aac|webm|mp4)(\?.*)?$/i;

export const getMessageMediaUrl = (message = {}) => {
  return message?.image || message?.audio || message?.mediaUrl || "";
};

export const getMessageMediaMimeType = (message = {}) => {
  return (
    message?.mimeType ||
    message?.mimetype ||
    message?.type ||
    message?.audioType ||
    ""
  );
};

export const isVideoMediaUrl = (url = "", mimeType = "") => {
  return mimeType.startsWith("video/") || VIDEO_FILE_EXT_RE.test(url);
};

export const isAudioMediaUrl = (url = "", mimeType = "") => {
  return mimeType.startsWith("audio/") || AUDIO_FILE_EXT_RE.test(url);
};

export const getVideoPosterUrl = (url = "") => {
  if (!url || !CLOUDINARY_VIDEO_PATH_RE.test(url)) {
    return "";
  }

  const [baseUrl, query = ""] = url.split("?");
  const posterUrl = baseUrl
    .replace(
      CLOUDINARY_VIDEO_PATH_RE,
      "/video/upload/so_1,c_fill,g_auto,w_320,h_320/",
    )
    .replace(VIDEO_FILE_EXT_RE, ".jpg");

  return query ? `${posterUrl}?${query}` : posterUrl;
};
