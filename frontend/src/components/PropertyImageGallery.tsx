import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

export interface PropertyImageGalleryProps {
  images: Array<{ id: string; url: string }>;
  title: string;
}

export function PropertyImageGallery({
  images,
  title,
}: PropertyImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-200/60">
        <ImageIcon className="w-8 h-8 stroke-[1.5] text-slate-300" />
        <span className="text-xs font-semibold mt-1">No Photos Uploaded</span>
      </div>
    );
  }

  console.log("images: ", images);

  const currentImage = images[currentIndex]?.url;

  return (
    <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden select-none">
      {/* Layer 1: Blurred Background Backdrop (Eliminates letterboxing black bars) */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-40 scale-110"
        style={{ backgroundImage: `url(${currentImage})` }}
      />

      {/* Layer 2: Main Image with Contained Aspect Ratio */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
        <img
          key={currentImage}
          src={currentImage}
          alt={`${title} - Photo ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-xl shadow-lg transition-all duration-300"
        />
      </div>

      {/* Navigation Controls */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) =>
                prev === 0 ? images.length - 1 : prev - 1,
              );
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) =>
                prev === images.length - 1 ? 0 : prev + 1,
              );
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicator Pills */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? "w-4 bg-emerald-400"
                    : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
