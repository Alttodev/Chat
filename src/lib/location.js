const LOCATION_MARKER_PREFIX = "[[location:";
const LOCATION_MARKER_SUFFIX = "]]";

export const createLocationMarker = ({ name, url }) => {
  const encodedName = encodeURIComponent(name || "");
  const encodedUrl = encodeURIComponent(url || "");
  return `${LOCATION_MARKER_PREFIX}${encodedName}|${encodedUrl}${LOCATION_MARKER_SUFFIX}`;
};

export const extractLocationMarker = (text = "") => {
  const pattern = /\[\[location:([^|]+)\|([^\]]+)\]\]/;
  const match = text.match(pattern);

  if (!match) {
    return { text, location: null };
  }

  const [, encodedName, encodedUrl] = match;
  const location = {
    name: decodeURIComponent(encodedName),
    url: decodeURIComponent(encodedUrl),
  };

  return {
    text: text.replace(pattern, "").replace(/\n{3,}/g, "\n\n").trim(),
    location,
  };
};

export const appendLocationMarker = (text = "", location = null) => {
  const baseText = (text || "").trimEnd();

  if (!location?.name || !location?.url) {
    return baseText;
  }

  const marker = createLocationMarker(location);
  return baseText ? `${baseText}\n\n${marker}` : marker;
};

export const osmUrlFromLocation = ({ name, lat, lng }) => {
  if (typeof lat === "number" && typeof lng === "number") {
    const zoom = 15;
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
  }

  return name
    ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(name)}`
    : "";
};

let leafletAssetsPromise = null;

const LEAFLET_CSS_ID = "codex-leaflet-css";
const LEAFLET_SCRIPT_ID = "codex-leaflet-script";

const ensureLeafletCss = () => {
  if (document.getElementById(LEAFLET_CSS_ID)) {
    return;
  }

  const link = document.createElement("link");
  link.id = LEAFLET_CSS_ID;
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
};

export const loadLeafletAssets = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Leaflet is only available in browser"));
  }

  if (window.L) {
    ensureLeafletCss();
    return Promise.resolve(window.L);
  }

  if (leafletAssetsPromise) {
    return leafletAssetsPromise;
  }

  leafletAssetsPromise = new Promise((resolve, reject) => {
    ensureLeafletCss();

    const existingScript = document.getElementById(LEAFLET_SCRIPT_ID);
    if (existingScript) {
      if (window.L) {
        resolve(window.L);
      } else {
        existingScript.addEventListener("load", () => resolve(window.L), {
          once: true,
        });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Failed to load Leaflet")),
          { once: true },
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.id = LEAFLET_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Failed to load Leaflet"));
    document.head.appendChild(script);
  });

  return leafletAssetsPromise;
};

const buildNominatimUrl = (path, params) => {
  const url = new URL(`https://nominatim.openstreetmap.org/${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const parseNominatimResult = (result, fallbackName = "Selected location") => {
  const lat = Number.parseFloat(result?.lat);
  const lng = Number.parseFloat(result?.lon);
  const name = result?.display_name || result?.name || fallbackName;

  return {
    name,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    url: osmUrlFromLocation({
      name,
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
    }),
  };
};

export const searchLocationWithNominatim = async (query) => {
  const response = await fetch(
    buildNominatimUrl("search", {
      q: query,
      format: "jsonv2",
      addressdetails: 1,
      limit: 5,
    }),
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Location search failed");
  }

  const results = await response.json();
  return Array.isArray(results) ? results.map((result) => parseNominatimResult(result, query)) : [];
};

export const reverseGeocodeWithNominatim = async (lat, lng) => {
  const response = await fetch(
    buildNominatimUrl("reverse", {
      lat,
      lon: lng,
      format: "jsonv2",
      addressdetails: 1,
    }),
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }

  const result = await response.json();

  if (!result?.display_name) {
    return null;
  }

  return parseNominatimResult(result);
};
