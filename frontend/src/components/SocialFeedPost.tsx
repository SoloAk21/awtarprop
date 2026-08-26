import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "../hooks/useTranslation.js";
import { useFavoritesStore } from "../store/useFavoritesStore.js";
import { MultiImageGrid } from "./MultiImageGrid.js";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  CheckCircle2,
  Share2,
  MessageSquare,
  Phone,
  MoreHorizontal,
  Send,
  Heart,
} from "lucide-react";

export interface SocialFeedPostProps {
  property: any;
  onOpenDetails: (property: any) => void;
  onOpenImageIndex: (property: any, imageIndex: number) => void;
}

export const SocialFeedPost = React.memo(function SocialFeedPost({
  property,
  onOpenDetails,
  onOpenImageIndex,
}: SocialFeedPostProps) {
  const { currentLanguage } = useTranslation();
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const [isExpanded, setIsExpanded] = useState(false);
  const [likeHeartAnim, setLikeHeartAnim] = useState(false);

  const favorited = useMemo(
    () => favoriteIds.includes(property.id),
    [favoriteIds, property.id],
  );

  const title = currentLanguage === "AM" ? property.titleAm : property.titleEn;
  const description =
    currentLanguage === "AM" ? property.descriptionAm : property.descriptionEn;

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const badge = useMemo(() => {
    switch (property.purpose) {
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
          text: "Buy Request",
          bg: "bg-purple-50 text-purple-800 border-purple-200",
        };
      default:
        return {
          text: "Rent Request",
          bg: "bg-amber-50 text-amber-800 border-amber-200",
        };
    }
  }, [property.purpose]);

  const images = property.images || [];

  const shouldTruncate = description && description.length > 120;
  const displayText =
    shouldTruncate && !isExpanded
      ? `${description.slice(0, 120)}...`
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

  const handleDoubleTap = useCallback(() => {
    if (!favorited) {
      toggleFavorite(property.id);
    }
    setLikeHeartAnim(true);
    setTimeout(() => setLikeHeartAnim(false), 800);
  }, [favorited, property.id, toggleFavorite]);

  const telegramUsername = property.provider?.username;
  const contactPhone = property.provider?.phoneNumber;

  return (
    <article className="bg-white border-b border-slate-100 pb-4 mb-2">
      {/* 1. USER HEADER */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0 relative">
            {property.provider?.firstName?.charAt(0) || "U"}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900 text-xs leading-none">
                {property.provider?.firstName}{" "}
                {property.provider?.lastName || ""}
              </h4>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                {property.providerType}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">
              @{property.provider?.username || "user"} · {property.areaName},{" "}
              {property.region}
            </p>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="p-1.5 text-slate-400 hover:text-slate-700"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 2. PRICE & PURPOSE BADGE BAR */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <span
          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
        >
          {badge.text}
        </span>
        <span className="text-base font-black text-emerald-600">
          {formatCurrency(Number(property.priceETB))}
        </span>
      </div>

      {/* 3. MULTI-IMAGE COLLAGE */}
      <div className="relative" onDoubleClick={handleDoubleTap}>
        <MultiImageGrid
          images={images}
          onImageClick={(index) => onOpenImageIndex(property, index)}
        />
        {likeHeartAnim && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none animate-in zoom-in duration-200">
            <Heart className="w-16 h-16 fill-red-500 text-red-500 drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* 4. CAPTION */}
      <div className="px-4 pt-3 space-y-2">
        <div
          onClick={() => onOpenDetails(property)}
          className="cursor-pointer space-y-1"
        >
          <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
            {title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-line">
            {displayText}
            {shouldTruncate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="ml-1 text-emerald-600 font-bold hover:underline"
              >
                {isExpanded ? "Less" : "... More"}
              </button>
            )}
          </p>
        </div>

        {/* Specs Bar */}
        <div className="flex items-center gap-3 text-xs text-slate-600 pt-1 font-semibold border-t border-slate-100">
          {property.bedrooms !== undefined && property.bedrooms !== null && (
            <div className="flex items-center gap-1 text-[11px]">
              <Bed className="w-3.5 h-3.5 text-emerald-600" />
              <span>{property.bedrooms} Beds</span>
            </div>
          )}
          {property.bathrooms !== undefined && property.bathrooms !== null && (
            <div className="flex items-center gap-1 text-[11px]">
              <Bath className="w-3.5 h-3.5 text-emerald-600" />
              <span>{property.bathrooms} Baths</span>
            </div>
          )}
          {property.areaSqMeters !== undefined &&
            property.areaSqMeters !== null && (
              <div className="flex items-center gap-1 text-[11px]">
                <Maximize className="w-3.5 h-3.5 text-emerald-600" />
                <span>{property.areaSqMeters} m²</span>
              </div>
            )}
          <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
            <MapPin className="w-3 h-3 text-emerald-500" />
            <span>{property.subCity || property.region}</span>
          </div>
        </div>
      </div>

      {/* 5. ACTION BUTTONS */}
      <div className="px-4 pt-3 flex items-center justify-between border-t border-slate-100 mt-2">
        <button
          type="button"
          onClick={() => toggleFavorite(property.id)}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
            favorited
              ? "bg-red-50 text-red-600"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${favorited ? "fill-red-500 text-red-500" : ""}`}
          />
          <span>{favorited ? "Saved" : "Save"}</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenDetails(property)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span>Inquire</span>
        </button>

        {telegramUsername && (
          <a
            href={`https://t.me/${telegramUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Chat</span>
          </a>
        )}

        {contactPhone && (
          <a
            href={`tel:${contactPhone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            <Phone className="w-4 h-4 text-slate-500" />
          </a>
        )}
      </div>
    </article>
  );
});
