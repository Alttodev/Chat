const CLOUDINARY_VIDEO_PATH_RE = /\/video\/upload\//;
const VIDEO_FILE_EXT_RE = /\.(mp4|mov|webm|m4v)(\?.*)?$/i;

export const isVideoMediaUrl = (url = "", mimeType = "") => {
  return mimeType.startsWith("video/") || VIDEO_FILE_EXT_RE.test(url);
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
