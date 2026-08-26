import React from "react";
import { Image as ImageIcon } from "lucide-react";

export interface MultiImageGridProps {
  images: Array<{ id: string; url: string }>;
  onImageClick: (index: number) => void;
}

export const MultiImageGrid = React.memo(function MultiImageGrid({
  images,
  onImageClick,
}: MultiImageGridProps) {
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[16/10] bg-slate-100 flex flex-col items-center justify-center text-slate-400 select-none">
        <ImageIcon className="w-7 h-7 stroke-[1.5]" />
        <span className="text-[10px] font-medium mt-1">No Photos Uploaded</span>
      </div>
    );
  }

  const count = images.length;

  if (count === 1) {
    return (
      <div
        onClick={() => onImageClick(0)}
        className="w-full aspect-[16/10] bg-slate-100 overflow-hidden cursor-pointer relative"
      >
        <img
          src={images[0].url}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="w-full aspect-[16/10] grid grid-cols-2 gap-0.5 bg-slate-200 overflow-hidden cursor-pointer">
        {images.slice(0, 2).map((img, idx) => (
          <div
            key={img.id || idx}
            onClick={() => onImageClick(idx)}
            className="relative h-full overflow-hidden"
          >
            <img
              src={img.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="w-full aspect-[16/10] grid grid-cols-3 gap-0.5 bg-slate-200 overflow-hidden cursor-pointer">
        <div
          onClick={() => onImageClick(0)}
          className="col-span-2 h-full overflow-hidden relative"
        >
          <img
            src={images[0].url}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="grid grid-rows-2 gap-0.5 h-full">
          {images.slice(1, 3).map((img, idx) => (
            <div
              key={img.id || idx}
              onClick={() => onImageClick(idx + 1)}
              className="h-full overflow-hidden relative"
            >
              <img
                src={img.url}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const extraCount = count - 4;

  return (
    <div className="w-full aspect-[16/10] grid grid-cols-2 grid-rows-2 gap-0.5 bg-slate-200 overflow-hidden cursor-pointer">
      {images.slice(0, 4).map((img, idx) => {
        const isLast = idx === 3 && extraCount > 0;
        return (
          <div
            key={img.id || idx}
            onClick={() => onImageClick(idx)}
            className="relative h-full overflow-hidden"
          >
            <img
              src={img.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {isLast && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-extrabold text-base">
                +{extraCount + 1}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
