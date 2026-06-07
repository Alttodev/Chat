import React, { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

export function MediaCarousel({ images }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrent(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <div className="relative w-full">
      {/* Counter */}
      <div className="absolute top-2 right-2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
        {current + 1}/{images.length}
      </div>

      {/* Carousel */}
      <div className="overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="flex">
          {images.map((img, i) => (
            <div key={i} className="min-w-full">
              <img
                src={img}
                alt={`media-${i}`}
                className="w-full aspect-square object-cover select-none"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-4 bg-emerald-500" : "w-1.5 bg-emerald-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
