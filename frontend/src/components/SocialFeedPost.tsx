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
  Sparkles,
  Award,
  Hash,
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

  // Convert amenities array to hashtag strings (#Parking #BackupGenerator)
  const amenityHashtags = useMemo(() => {
    return amenities.map((a) => `#${a.replace(/[^a-zA-Z0-9]/g, "")}`).join(" ");
  }, [amenities]);

  const shouldTruncate = description && description.length > 100;
  const displayText =
    shouldTruncate && !isExpanded
      ? `${description.slice(0, 100)}...`
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
      </div>

      {/* 2. UNCLUTTERED MULTI-PHOTO COLLAGE */}
      <MultiImageGrid
        images={images}
        onImageClick={(index) => onOpenImageIndex(property, index)}
      />

      {/* 3. COMPACT ACTION BAR (COMPACT LEFT / SAVE RIGHT) */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100/80">
        {/* Left Compact Action Icons */}
        <div className="flex items-center gap-1">
          {telegramUsername && (
            <a
              href={`https://t.me/${telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
              title="Chat on Telegram"
            >
              <Send className="w-4 h-4" />
            </a>
          )}

          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Call Provider"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Share Listing"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right Views & Bookmark Icon Only */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>{property.viewsCount || 0} views</span>
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite(property.id)}
            className={`p-2 rounded-xl transition-colors ${
              favorited
                ? "bg-emerald-50 text-emerald-600"
                : "text-slate-500 hover:bg-slate-100"
            }`}
            title={favorited ? "Remove Bookmark" : "Save Bookmark"}
          >
            <Bookmark
              className={`w-4 h-4 ${favorited ? "fill-emerald-600 text-emerald-600" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* 4. TRUE CAPTION BLOCK */}
      <div className="px-4 pt-2.5 space-y-2">
        {/* Category · Purpose · Price Line */}
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-500 text-[11px]">
            {property.category?.replace(/_/g, " ")} ·{" "}
            {getPurposeText(property.purpose)}
          </span>
          <span className="text-sm font-black text-emerald-600">
            {formatCurrency(Number(property.priceETB))}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
          {title}
        </h3>

        {/* Collapsible Description Text */}
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

        {/* VERTICAL SPECIFICATIONS LIST & HASHTAGS (Rendered in Caption / Expanded) */}
        {(isExpanded || !shouldTruncate) && (
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs font-semibold text-slate-700 animate-in fade-in duration-150">
            <div className="space-y-1">
              {property.bedrooms !== undefined &&
                property.bedrooms !== null && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{property.bedrooms} Beds</span>
                  </div>
                )}

              {property.bathrooms !== undefined &&
                property.bathrooms !== null && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{property.bathrooms} Baths</span>
                  </div>
                )}

              {property.areaSqMeters !== undefined &&
                property.areaSqMeters !== null && (
                  <div className="flex items-center gap-2">
                    <Maximize className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{property.areaSqMeters} m²</span>
                  </div>
                )}

              {property.isFurnished && (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Furnished</span>
                </div>
              )}

              {property.condition && (
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Condition: {property.condition}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  Location: {property.areaName},{" "}
                  {property.subCity ? `${property.subCity}, ` : ""}
                  {property.region}
                </span>
              </div>
            </div>

            {/* Amenity Hashtags */}
            {amenityHashtags && (
              <div className="pt-1 text-[11px] font-bold text-emerald-700 leading-relaxed flex items-start gap-1">
                <Hash className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="line-clamp-2">{amenityHashtags}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
});
