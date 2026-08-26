import React, { useEffect, useState } from "react";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  ShieldCheck,
  Eye,
  Bookmark,
  Image as ImageIcon,
} from "lucide-react";

import { useTranslation } from "../hooks/useTranslation.js";
import { useFavoritesStore } from "../store/useFavoritesStore.js";

export interface PropertyCardProps {
  property?: any;
  from?: string;
  [key: string]: any;
}

interface PropertyImage {
  id?: string;
  url?: string;
  secure_url?: string;
  isMain?: boolean;
  order?: number;
}

function getImageUrl(
  image: PropertyImage | string | null | undefined,
): string | null {
  if (!image) return null;

  if (typeof image === "string") {
    return image.trim() || null;
  }

  if (typeof image === "object") {
    const url = image.url || image.secure_url;
    if (typeof url === "string" && url.trim()) {
      return url.trim();
    }
  }

  return null;
}

function getMainImage(images: unknown): string | null {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  const validImages = images.filter(Boolean);

  // Prefer explicitly marked main image
  const mainImage = validImages.find(
    (image: PropertyImage) => image?.isMain === true,
  );

  const mainUrl = getImageUrl(mainImage);
  if (mainUrl) return mainUrl;

  // Fallback to first image with a valid URL
  for (const image of validImages) {
    const url = getImageUrl(image);
    if (url) return url;
  }

  return null;
}

export function PropertyCard(props: PropertyCardProps) {
  // Prefer the full property object when it is supplied

  console.log("%c[PropertyCard RAW PROPS]", "color: red; font-weight: bold", {
    allKeys: Object.keys(props),
    hasProperty: !!props.property,
    from: props.from,
    images: props.images,
    propertyImages: props.property?.images,
    id: props.id || props.property?.id,
  });
  const property = props.property || props;

  const id = property?.id || "";
  const titleEn = property?.titleEn || "";
  const titleAm = property?.titleAm || "";
  const priceETB = Number(property?.priceETB || 0);

  const areaSqMeters =
    property?.areaSqMeters !== null && property?.areaSqMeters !== undefined
      ? Number(property.areaSqMeters)
      : undefined;

  const bedrooms = property?.bedrooms;
  const bathrooms = property?.bathrooms;
  const region = property?.region || "";
  const subCity = property?.subCity || "";
  const areaName = property?.areaName || "";
  const providerType = property?.providerType || "";
  const viewsCount = Number(property?.viewsCount || 0);
  const purpose = property?.purpose || "";

  const source = props.from || "DirectProp";
  const { currentLanguage } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  // Robust images extraction
  const images: PropertyImage[] = (() => {
    if (Array.isArray(property?.images) && property.images.length > 0) {
      return property.images;
    }
    if (Array.isArray(props.images) && props.images.length > 0) {
      return props.images;
    }
    return [];
  })();

  const mainImage = getMainImage(images);
  const title =
    currentLanguage === "AM" ? titleAm || titleEn : titleEn || titleAm;
  const favorited = isFavorite(id);

  useEffect(() => {
    setImageLoadFailed(false);
  }, [id, mainImage]);

  // Debug log (remove later if you want)
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    console.log("[PropertyCard]", {
      source,
      propertyId: id,
      hasPropertyProp: !!props.property,
      propertyImagesLength: property?.images?.length ?? 0,
      propsImagesLength: props.images?.length ?? 0,
      imageCount: images.length,
      mainImage,
    });
  }, [source, id, images, mainImage, property, props.images]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPurposeBadge = (purposeType: string) => {
    switch (purposeType) {
      case "FOR_SALE":
        return {
          text: "For Sale",
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "FOR_RENT":
        return {
          text: "For Rent",
          bg: "bg-blue-50 text-blue-800 border-blue-200",
        };
      case "LOOKING_TO_BUY":
        return {
          text: "Looking to Buy",
          bg: "bg-purple-50 text-purple-800 border-purple-200",
        };
      case "LOOKING_TO_RENT":
        return {
          text: "Looking to Rent",
          bg: "bg-amber-50 text-amber-800 border-amber-200",
        };
      default:
        return {
          text: purposeType || "Property",
          bg: "bg-slate-50 text-slate-700 border-slate-200",
        };
    }
  };

  const badge = getPurposeBadge(purpose);

  return (
    <article className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      {/* IMAGE */}
      <div className="relative w-full h-52 overflow-hidden bg-slate-100">
        {mainImage && !imageLoadFailed ? (
          <img
            src={mainImage}
            alt={title || "Property"}
            loading="eager"
            decoding="async"
            draggable={false}
            onLoad={() => {
              if (import.meta.env.DEV) {
                console.log(`[PropertyCard:${id}] Image loaded`, mainImage);
              }
            }}
            onError={(event) => {
              console.error(`[PropertyCard:${id}] Image failed to load`, {
                url: mainImage,
                src: event.currentTarget.src,
              });
              setImageLoadFailed(true);
            }}
            className="block w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-xs font-semibold">
              {images.length > 0 ? "Image unavailable" : "No Image Uploaded"}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Purpose Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span
            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-sm ${badge.bg}`}
          >
            {badge.text}
          </span>
        </div>

        {/* Favorite + Views */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            type="button"
            aria-label={
              favorited ? "Remove from favorites" : "Add to favorites"
            }
            onClick={(event) => {
              event.stopPropagation();
              toggleFavorite(id);
            }}
            className="p-1.5 rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur-md hover:bg-white transition-colors"
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                favorited ? "fill-emerald-600 text-emerald-600" : ""
              }`}
            />
          </button>

          <div className="flex items-center gap-1 text-[10px] font-bold bg-black/60 text-white px-2.5 py-1 rounded-full backdrop-blur-md">
            <Eye className="w-3 h-3 text-emerald-400" />
            <span>{viewsCount}</span>
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1 min-w-0">
            {title || "Untitled Property"}
          </h3>
          <span className="text-sm font-black text-emerald-600 whitespace-nowrap">
            {formatCurrency(priceETB)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold min-w-0">
          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="line-clamp-1">
            {areaName}
            {subCity ? `, ${subCity}` : ""}
            {region ? `, ${region}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-700 pt-2 border-t border-slate-100 font-bold">
          {bedrooms !== undefined && bedrooms !== null && (
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-emerald-600" />
              <span>{bedrooms} Beds</span>
            </div>
          )}
          {bathrooms !== undefined && bathrooms !== null && (
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-emerald-600" />
              <span>{bathrooms} Baths</span>
            </div>
          )}
          {areaSqMeters !== undefined && areaSqMeters !== null && (
            <div className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5 text-emerald-600" />
              <span>{areaSqMeters} m²</span>
            </div>
          )}
          {providerType && (
            <div className="ml-auto flex items-center gap-1 text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg font-extrabold text-slate-800">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{providerType}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
