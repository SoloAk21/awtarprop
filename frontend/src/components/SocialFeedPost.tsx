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

export const SocialFeedPost = React.memo(function SocialFeedPost({
  property,
  onOpenImageIndex,
}: SocialFeedPostProps) {
  const { currentLanguage } = useTranslation();
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

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

  // Convert amenities array to horizontal hashtags (#Parking #WaterTank #SecurityCCTV)
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

  return (
    <article className="bg-white border-b border-slate-100 pb-3 mb-2">
      {/* 1. USER / PROVIDER HEADER */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0 relative">
            {property.provider?.firstName?.charAt(0) || "U"}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h4 className="font-bold text-slate-900 text-xs leading-none">
                {property.provider?.firstName}{" "}
                {property.provider?.lastName || ""}
              </h4>
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="text-[9px] font-extrabold bg-slate-100 text-slate-700 px-1.5 py-0.25 rounded uppercase">
                {property.providerType}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">
              @{property.provider?.username || "user"}
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

      {/* 2. UNCLUTTERED MULTI-PHOTO COLLAGE */}
      <MultiImageGrid
        images={images}
        onImageClick={(index) => onOpenImageIndex(property, index)}
      />

      {/* 3. COMPACT ACTION BAR (LEFT: CHAT, CALL, SHARE | RIGHT: VIEWS, BOOKMARK) */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100/80">
        {/* Left Compact Icons */}
        <div className="flex items-center gap-1">
          {telegramUsername && (
            <a
              href={`https://t.me/${telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
              title="Chat"
            >
              <Send className="w-4 h-4" />
            </a>
          )}

          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Call"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right Compact Icons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 px-2 py-1 bg-slate-50 rounded-lg">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>{property.viewsCount || 0}</span>
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite(property.id)}
            className={`p-2 rounded-xl transition-colors ${
              favorited
                ? "bg-emerald-50 text-emerald-600"
                : "text-slate-500 hover:bg-slate-100"
            }`}
            title="Bookmark"
          >
            <Bookmark
              className={`w-4 h-4 ${favorited ? "fill-emerald-600 text-emerald-600" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* 4. CAPTION SECTION (FIRST: DESCRIPTION | SECOND: VERTICAL LIST WITH ICONS | THIRD: HORIZONTAL HASHTAGS) */}
      <div className="px-4 pt-2.5 space-y-2.5">
        {/* Title */}
        <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
          {title}
        </h3>

        {/* FIRST: Description Text (Collapsed with ... More) */}
        <div className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-line">
          <span>{displayText}</span>
          {shouldTruncate && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-1 text-emerald-600 font-bold hover:underline"
            >
              {isExpanded ? "Less" : "... More"}
            </button>
          )}
        </div>

        {/* SECOND: Vertical Specifications & Location List with Icons */}
        {(isExpanded || !shouldTruncate) && (
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs font-semibold text-slate-700 animate-in fade-in duration-150">
            {/* Purpose · Category · Price */}
            <div className="flex items-center gap-2 text-emerald-600 font-black">
              <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {getPurposeText(property.purpose)} ·{" "}
                {property.category?.replace(/_/g, " ")} ·{" "}
                {formatCurrency(Number(property.priceETB))}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-slate-600 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                {property.areaName},{" "}
                {property.subCity ? `${property.subCity}, ` : ""}
                {property.region}
              </span>
            </div>

            {/* Bedrooms */}
            {property.bedrooms !== undefined && property.bedrooms !== null && (
              <div className="flex items-center gap-2 text-slate-700">
                <Bed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{property.bedrooms} Beds</span>
              </div>
            )}

            {/* Bathrooms */}
            {property.bathrooms !== undefined &&
              property.bathrooms !== null && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Bath className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{property.bathrooms} Baths</span>
                </div>
              )}

            {/* Area m² */}
            {property.areaSqMeters !== undefined &&
              property.areaSqMeters !== null && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Maximize className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{property.areaSqMeters} m²</span>
                </div>
              )}

            {/* Furnished */}
            {property.isFurnished && (
              <div className="flex items-center gap-2 text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Furnished</span>
              </div>
            )}

            {/* Condition */}
            {property.condition && (
              <div className="flex items-center gap-2 text-slate-700">
                <Award className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Condition: {property.condition}</span>
              </div>
            )}

            {/* THIRD: Horizontal Hashtags Row at the Bottom */}
            {amenityHashtags && (
              <div className="pt-2 border-t border-slate-100/80 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 font-medium">Features:</span>
                <span>{amenityHashtags}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
});
