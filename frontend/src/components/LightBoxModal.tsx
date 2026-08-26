import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface LightBoxModalProps {
  images: Array<{ id: string; url: string }>;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function LightBoxModal({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  title,
}: LightBoxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || !images || images.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const activeImage = images[currentIndex]?.url;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 text-white flex flex-col justify-between p-3 select-none animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between z-20 pt-2 px-2">
        <div className="text-xs font-semibold text-slate-300">
          <span>{currentIndex + 1}</span>
          <span className="text-slate-500 mx-1">/</span>
          <span>{images.length}</span>
        </div>

        {title && (
          <h4 className="text-xs font-bold text-slate-200 line-clamp-1 max-w-[200px] text-center">
            {title}
          </h4>
        )}

        <button
          type="button"
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center my-auto overflow-hidden">
        {activeImage ? (
          <img
            key={activeImage}
            src={activeImage}
            alt={`Photo ${currentIndex + 1}`}
            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl transition-all duration-200"
          />
        ) : (
          <div className="text-slate-500 text-xs font-medium">
            Image unavailable
          </div>
        )}

        {/* Controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 pb-4 overflow-x-auto scrollbar-none px-2">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                idx === currentIndex
                  ? "border-emerald-500 scale-105"
                  : "border-transparent opacity-50"
              }`}
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
