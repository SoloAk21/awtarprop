import React from "react";
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
  id: string;
  titleEn: string;
  titleAm: string;
  category: string;
  purpose: string;
  priceETB: number;
  areaSqMeters?: number;
  bedrooms?: number;
  bathrooms?: number;
  region: string;
  subCity?: string;
  areaName: string;
  providerType: string;
  viewsCount: number;
  images?: any[];
  createdAt: string;
}

export function PropertyCard({
  id,
  titleEn,
  titleAm,
  category,
  purpose,
  priceETB,
  areaSqMeters,
  bedrooms,
  bathrooms,
  region,
  subCity,
  areaName,
  providerType,
  viewsCount,
  images = [],
}: PropertyCardProps) {
  const { currentLanguage } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const title = currentLanguage === "AM" ? titleAm : titleEn;
  const mainImage = images && images.length > 0 ? images[0].url : null;
  const favorited = isFavorite(id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPurposeBadge = (p: string) => {
    switch (p) {
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
      default:
        return {
          text: "Looking to Rent",
          bg: "bg-amber-50 text-amber-800 border-amber-200",
        };
    }
  };

  const badge = getPurposeBadge(purpose);

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md transition-all">
      {/* Image Banner */}
      <div className="h-44 bg-slate-100 relative flex items-center justify-center text-slate-400 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <ImageIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">No Image Uploaded</span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-xs ${badge.bg}`}
          >
            {badge.text}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(id);
            }}
            className="p-1.5 rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur-md hover:bg-white transition-colors"
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${favorited ? "fill-emerald-600 text-emerald-600" : ""}`}
            />
          </button>

          <div className="flex items-center gap-1 text-[10px] font-bold bg-black/60 text-white px-2.5 py-1 rounded-full backdrop-blur-md">
            <Eye className="w-3 h-3 text-emerald-400" />
            <span>{viewsCount}</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1">
            {title}
          </h3>
          <span className="text-sm font-black text-emerald-600 whitespace-nowrap">
            {formatCurrency(priceETB)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="line-clamp-1">
            {areaName}, {subCity ? `${subCity}, ` : ""}
            {region}
          </span>
        </div>

        {/* Specs */}
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
          <div className="ml-auto flex items-center gap-1 text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg font-extrabold text-slate-800">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>{providerType}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
