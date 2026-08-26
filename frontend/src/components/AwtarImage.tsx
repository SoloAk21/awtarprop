import React, { useState } from "react";
import { Image as ImageIcon, AlertCircle } from "lucide-react";

export interface AwtarImageProps {
  src?: string | null;
  alt: string;
  aspectRatio?:
    | "aspect-[4/3]"
    | "aspect-[16/9]"
    | "aspect-square"
    | "aspect-auto";
  objectFit?: "object-cover" | "object-contain";
  className?: string;
}

export function AwtarImage({
  src,
  alt,
  aspectRatio = "aspect-[4/3]",
  objectFit = "object-cover",
  className = "",
}: AwtarImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`w-full ${aspectRatio} bg-slate-100 border border-slate-200/60 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-4 select-none ${className}`}
      >
        <ImageIcon className="w-6 h-6 stroke-[1.5] text-slate-300" />
        <span className="text-[10px] font-semibold mt-1.5 text-slate-400">
          No Photo Available
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${aspectRatio} overflow-hidden rounded-2xl bg-slate-100 ${className}`}
    >
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200/80 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-slate-300 animate-bounce" />
        </div>
      )}

      {/* Rendered Image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full ${objectFit} transition-opacity duration-300 ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
