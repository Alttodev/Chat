import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Search, X } from "lucide-react";
import {
  loadLeafletAssets,
  osmUrlFromLocation,
  reverseGeocodeWithNominatim,
  searchLocationWithNominatim,
} from "@/lib/location";

const fallbackCenter = { lat: 37.0902, lng: -95.7129 };

export default function LocationPickerDialog({ open, onOpenChange, onSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const clearMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    mapInstanceRef.current = null;
    markerRef.current = null;
  };

  const setMarkerAndCenter = (leaflet, location) => {
    if (!mapInstanceRef.current || !location) return;

    const latLng = [location.lat, location.lng];
    mapInstanceRef.current.setView(latLng, 14);

    if (!markerRef.current) {
      markerRef.current = leaflet.marker(latLng).addTo(mapInstanceRef.current);
      return;
    }

    markerRef.current.setLatLng(latLng);
  };

  const buildLocation = (place, fallbackName = "Selected location") => ({
    name: place?.name || place?.display_name || fallbackName,
    lat: place?.lat,
    lng: place?.lng,
    url: place?.url || osmUrlFromLocation(place),
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedLocation(null);
      setLoading(false);
      setError("");
      clearMap();
      return undefined;
    }

    let cancelled = false;

    loadLeafletAssets()
      .then((leaflet) => {
        if (cancelled || !mapRef.current) return;

        const map = leaflet.map(mapRef.current, {
          center: [fallbackCenter.lat, fallbackCenter.lng],
          zoom: 4,
          zoomControl: true,
          attributionControl: true,
        });

        mapInstanceRef.current = map;
        leaflet
          .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          })
          .addTo(map);

        map.on("click", async (event) => {
          const { lat, lng } = event.latlng || {};
          if (typeof lat !== "number" || typeof lng !== "number") return;

          setLoading(true);
          setError("");

          try {
            const place = await reverseGeocodeWithNominatim(lat, lng);
            if (cancelled) return;

            const location = buildLocation(
              place || {
                name: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
                lat,
                lng,
                url: osmUrlFromLocation({ lat, lng }),
              },
            );

            setSelectedLocation(location);
            setMarkerAndCenter(leaflet, location);
          } catch (err) {
            if (cancelled) return;
            setError(err?.message || "Could not resolve this location");
          } finally {
            if (!cancelled) {
              setLoading(false);
            }
          }
        });

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (cancelled || !mapInstanceRef.current) return;
              const current = [
                position.coords.latitude,
                position.coords.longitude,
              ];
              mapInstanceRef.current.setView(current, 12);
            },
            () => {
              if (cancelled || !mapInstanceRef.current) return;
              mapInstanceRef.current.setView(
                [fallbackCenter.lat, fallbackCenter.lng],
                4,
              );
            },
          );
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Unable to load map");
      });

    return () => {
      cancelled = true;
      clearMap();
    };
  }, [open]);

  const handleSearch = async () => {
    const term = query.trim();
    if (!term || !mapInstanceRef.current) return;

    setError("");
    setLoading(true);

    try {
      const results = await searchLocationWithNominatim(term);
      const place = results[0];

      if (!place) {
        setError("No matching location found");
        return;
      }

      const location = buildLocation(place, term);
      setSelectedLocation(location);

      if (typeof location.lat === "number" && typeof location.lng === "number") {
        const leaflet = window.L;
        if (leaflet) {
          setMarkerAndCenter(leaflet, location);
        }
      }
    } catch (err) {
      setError(err?.message || "No matching location found");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleUseLocation = () => {
    if (!selectedLocation) return;
    onSelect(selectedLocation);
    onOpenChange(false);
  };

  const handleClearSelection = () => {
    setSelectedLocation(null);
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
  w-[calc(100%-1rem)]
  max-w-[760px]
  rounded-lg
  p-4
  sm:rounded-xl
  [&_button]:cursor-pointer
"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            Add Location
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search a place or address"
                className="pl-9 pr-9"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <Button
              type="button"
              onClick={handleSearch}
              disabled={!query.trim() || loading}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border bg-muted/30">
            <div ref={mapRef} className="h-[320px] w-full" />
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {selectedLocation?.name ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2">
              <a
                href={selectedLocation.url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1  text-sm font-medium text-emerald-700 hover:underline"
              >
                {selectedLocation.name}
              </a>
              <button
                type="button"
                onClick={handleClearSelection}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
                aria-label="Clear selected location"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Search above or click on the map to pick a place.
            </p>

            <Button
              type="button"
              disabled={!selectedLocation || loading}
              onClick={handleUseLocation}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                "Use location"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
