import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation.js";
import { useFavoritesStore } from "../store/useFavoritesStore.js";
import { MultiImageGrid } from "./MultiImageGrid.js";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Bookmark,
  Share2,
  Phone,
  Send,
  Eye,
  CheckCircle2,
  MoreHorizontal,
  Sparkles,
  Award,
  Tag,
} from "lucide-react";

export interface SocialFeedPostProps {
  property: any;
  onOpenImageIndex: (property: any, imageIndex: number) => void;
  onOpenDetails?: (property: any) => void;
}

/**
 * Calculates relative time ago from ISO date string.
 */
function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Just now";
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const SocialFeedPost = React.memo(function SocialFeedPost({
  property,
  onOpenImageIndex,
}: SocialFeedPostProps) {
  const { currentLanguage } = useTranslation();
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  // Collapse state applies strictly to description text
  const [isExpanded, setIsExpanded] = useState(false);

  const title = currentLanguage === "AM" ? property.titleAm : property.titleEn;
  const description =
    currentLanguage === "AM" ? property.descriptionAm : property.descriptionEn;
  const favorited = useMemo(
    () => favoriteIds.includes(property.id),
    [favoriteIds, property.id],
  );

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const getPurposeText = (p: string) => {
    switch (p) {
      case "FOR_SALE":
        return "For Sale";
      case "FOR_RENT":
        return "For Rent";
      case "LOOKING_TO_BUY":
        return "Buy Request";
      default:
        return "Rent Request";
    }
  };

  const images = property.images || [];
  const amenities: string[] = property.amenities || [];

  const amenityHashtags = useMemo(() => {
    return amenities.map((a) => `#${a.replace(/[^a-zA-Z0-9]/g, "")}`).join(" ");
  }, [amenities]);

  const shouldTruncate = description && description.length > 110;
  const displayText =
    shouldTruncate && !isExpanded
      ? `${description.slice(0, 110)}...`
      : description;

  const handleShare = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const shareText = encodeURIComponent(
        `Check out this property on AwtarProp: ${title} - ${formatCurrency(Number(property.priceETB))}`,
      );
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${shareText}`;

      if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(shareUrl);
      } else {
        window.open(shareUrl, "_blank");
      }
    },
    [property.priceETB, title, formatCurrency],
  );

  const telegramUsername = property.provider?.username;
  const contactPhone = property.provider?.phoneNumber;
  const timeAgoText = useMemo(
    () => formatTimeAgo(property.createdAt),
    [property.createdAt],
  );

  return (
    <article className="bg-white border-b border-slate-100 pb-3 mb-2">
      {/* 1. USER HEADER WITH POSTED TIME */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-xs shrink-0 relative">
            {property.provider?.firstName?.charAt(0) || "U"}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-slate-900 text-xs leading-none">
                {property.provider?.firstName}{" "}
                {property.provider?.lastName || ""}
              </h4>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[10px] font-semibold text-slate-500">
                • {property.providerType}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">
              @{property.provider?.username || "user"} • {timeAgoText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="p-1.5 text-slate-400 hover:text-slate-700"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 2. MULTI-PHOTO COLLAGE */}
      <MultiImageGrid
        images={images}
        onImageClick={(index) => onOpenImageIndex(property, index)}
      />

      {/* 3. NAKED COMPACT ACTION BAR (NO CARD BACKGROUNDS) */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100/80">
        {/* Left Naked Icons */}
        <div className="flex items-center gap-4 text-slate-700">
          {telegramUsername && (
            <a
              href={`https://t.me/${telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-700 hover:text-emerald-600 transition-colors"
              title="Chat"
            >
              <Send className="w-4 h-4 stroke-[2]" />
            </a>
          )}

          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              onClick={(e) => e.stopPropagation()}
              className="text-slate-700 hover:text-emerald-600 transition-colors"
              title="Call"
            >
              <Phone className="w-4 h-4 stroke-[2]" />
            </a>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="text-slate-700 hover:text-emerald-600 transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Right Naked Icons (Views + Bookmark Icon Only) */}
        <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4 stroke-[2] text-slate-500" />
            <span className="text-[11px] font-medium">
              {property.viewsCount || 0}
            </span>
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite(property.id)}
            className="text-slate-700 hover:text-emerald-600 transition-colors"
            title="Bookmark"
          >
            <Bookmark
              className={`w-4 h-4 stroke-[2] ${favorited ? "fill-emerald-600 text-emerald-600" : "text-slate-700"}`}
            />
          </button>
        </div>
      </div>

      {/* 4. CAPTION SECTION */}
      <div className="px-4 pt-2.5 space-y-2">
        {/* Title */}
        <h3 className="font-bold text-slate-900 text-sm leading-snug">
          {title}
        </h3>

        {/* FIRST: Description Text (ISOLATED COLLAPSE WITH ... More) */}
        <div className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-line">
          <span>{displayText}</span>
          {shouldTruncate && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-1 text-emerald-600 font-semibold hover:underline"
            >
              {isExpanded ? "Less" : "... More"}
            </button>
          )}
        </div>

        {/* SECOND: Vertical Specifications & Location List (ALWAYS VISIBLE) */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs font-medium text-slate-700">
          {/* Purpose · Category · Price */}
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <Tag className="w-3.5 h-3.5 stroke-[2] text-emerald-600 shrink-0" />
            <span>
              {getPurposeText(property.purpose)} ·{" "}
              {property.category?.replace(/_/g, " ")} ·{" "}
              {formatCurrency(Number(property.priceETB))}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 stroke-[2] text-slate-500 shrink-0" />
            <span>
              {property.areaName},{" "}
              {property.subCity ? `${property.subCity}, ` : ""}
              {property.region}
            </span>
          </div>

          {/* Bedrooms */}
          {property.bedrooms !== undefined && property.bedrooms !== null && (
            <div className="flex items-center gap-2 text-slate-700">
              <Bed className="w-3.5 h-3.5 stroke-[2] text-slate-500 shrink-0" />
              <span>{property.bedrooms} Beds</span>
            </div>
          )}

          {/* Bathrooms */}
          {property.bathrooms !== undefined && property.bathrooms !== null && (
            <div className="flex items-center gap-2 text-slate-700">
              <Bath className="w-3.5 h-3.5 stroke-[2] text-slate-500 shrink-0" />
              <span>{property.bathrooms} Baths</span>
            </div>
          )}

          {/* Area m² */}
          {property.areaSqMeters !== undefined &&
            property.areaSqMeters !== null && (
              <div className="flex items-center gap-2 text-slate-700">
                <Maximize className="w-3.5 h-3.5 stroke-[2] text-slate-500 shrink-0" />
                <span>{property.areaSqMeters} m²</span>
              </div>
            )}

          {/* Furnished */}
          {property.isFurnished && (
            <div className="flex items-center gap-2 text-slate-700">
              <Sparkles className="w-3.5 h-3.5 stroke-[2] text-slate-500 shrink-0" />
              <span>Furnished</span>
            </div>
          )}

          {/* Condition */}
          {property.condition && (
            <div className="flex items-center gap-2 text-slate-700">
              <Award className="w-3.5 h-3.5 stroke-[2] text-slate-500 shrink-0" />
              <span>Condition: {property.condition}</span>
            </div>
          )}

          {/* THIRD: Horizontal Hashtags Row */}
          {amenityHashtags && (
            <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-normal">Features:</span>
              <span>{amenityHashtags}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
});
