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

function formatTimeAgo(dateString?: string, isAmharic = false): string {
  if (!dateString) return isAmharic ? "አሁን" : "Just now";
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return isAmharic ? "አሁን" : "Just now";
  if (diffMins < 60)
    return isAmharic ? `ከ ${diffMins} ደቂቃ በፊት` : `${diffMins}m ago`;
  if (diffHours < 24)
    return isAmharic ? `ከ ${diffHours} ሰዓት በፊት` : `${diffHours}h ago`;
  if (diffDays < 7)
    return isAmharic ? `ከ ${diffDays} ቀን በፊት` : `${diffDays}d ago`;
  return past.toLocaleDateString(isAmharic ? "am-ET" : "en-US", {
    month: "short",
    day: "numeric",
  });
}

export const SocialFeedPost = React.memo(function SocialFeedPost({
  property,
  onOpenImageIndex,
}: SocialFeedPostProps) {
  const {
    t,
    currentLanguage,
    translateCategory,
    translatePurpose,
    translateProviderType,
  } = useTranslation();
  const isAmharic = currentLanguage === "AM";

  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const [isExpanded, setIsExpanded] = useState(false);

  // Pure Localized Content Selection
  const title = isAmharic
    ? property.titleAm || property.titleEn
    : property.titleEn || property.titleAm;
  const description = isAmharic
    ? property.descriptionAm || property.descriptionEn
    : property.descriptionEn || property.descriptionAm;
  const favorited = useMemo(
    () => favoriteIds.includes(property.id),
    [favoriteIds, property.id],
  );

  const formatCurrency = useCallback(
    (amount: number) => {
      return new Intl.NumberFormat(isAmharic ? "am-ET" : "en-ET", {
        style: "currency",
        currency: "ETB",
        maximumFractionDigits: 0,
      }).format(amount);
    },
    [isAmharic],
  );

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
        `${title} - ${formatCurrency(Number(property.priceETB))}`,
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
    () => formatTimeAgo(property.createdAt, isAmharic),
    [property.createdAt, isAmharic],
  );

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
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[9px] font-extrabold bg-slate-100 text-slate-700 px-1.5 py-0.25 rounded">
                {translateProviderType(property.providerType)}
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

      {/* 2. UNCLUTTERED MULTI-PHOTO COLLAGE */}
      <MultiImageGrid
        images={images}
        onImageClick={(index) => onOpenImageIndex(property, index)}
      />

      {/* 3. COMPACT ACTION BAR */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100/80">
        <div className="flex items-center gap-1">
          {telegramUsername && (
            <a
              href={`https://t.me/${telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
              title={t("chat")}
            >
              <Send className="w-4 h-4 stroke-[2]" />
            </a>
          )}

          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title={t("call")}
            >
              <Phone className="w-4 h-4 stroke-[2]" />
            </a>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title={t("share")}
          >
            <Share2 className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4 stroke-[2] text-slate-500" />
            <span className="text-[11px] font-medium">
              {property.viewsCount || 0} {t("views")}
            </span>
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite(property.id)}
            className="text-slate-700 hover:text-emerald-600 transition-colors"
            title={t("save")}
          >
            <Bookmark
              className={`w-4 h-4 stroke-[2] ${favorited ? "fill-emerald-600 text-emerald-600" : "text-slate-700"}`}
            />
          </button>
        </div>
      </div>

      {/* 4. LOCALIZED CAPTION SECTION */}
      <div className="px-4 pt-2.5 space-y-2.5">
        <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
          {title}
        </h3>

        {/* FIRST: Description Text */}
        <div className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-line">
          <span>{displayText}</span>
          {shouldTruncate && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-1 text-emerald-600 font-bold hover:underline"
            >
              {isExpanded ? t("less") : t("more")}
            </button>
          )}
        </div>

        {/* SECOND: Vertical Specifications & Location List */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs font-medium text-slate-700">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold">
            <Tag className="w-3.5 h-3.5 stroke-[2] text-emerald-600 shrink-0" />
            <span>
              {translatePurpose(property.purpose)} ·{" "}
              {translateCategory(property.category)} ·{" "}
              {formatCurrency(Number(property.priceETB))}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 stroke-[2] text-slate-500 shrink-0" />
            <span>
              {property.areaName},{" "}
              {property.subCity ? `${property.subCity}, ` : ""}
              {property.region}
            </span>
          </div>

          {property.bedrooms !== undefined && property.bedrooms !== null && (
            <div className="flex items-center gap-2 text-slate-700">
              <Bed className="w-3.5 h-3.5 stroke-[2] text-slate-500 shrink-0" />
              <span>
                {property.bedrooms} {t("beds")}
              </span>
            </div>
          )}

          {property.bathrooms !== undefined && property.bathrooms !== null && (
            <div className="flex items-center gap-2 text-slate-700">
              <Bath className="w-3.5 h-3.5 stroke-[2] text-slate-500 shrink-0" />
              <span>
                {property.bathrooms} {t("baths")}
              </span>
            </div>
          )}

          {property.areaSqMeters !== undefined &&
            property.areaSqMeters !== null && (
              <div className="flex items-center gap-2 text-slate-700">
                <Maximize className="w-3.5 h-3.5 stroke-[2] text-slate-500 shrink-0" />
                <span>
                  {property.areaSqMeters} {t("sqm")}
                </span>
              </div>
            )}

          {property.isFurnished && (
            <div className="flex items-center gap-2 text-slate-700">
              <Sparkles className="w-3.5 h-3.5 stroke-[2] text-slate-500 shrink-0" />
              <span>{t("furnished")}</span>
            </div>
          )}

          {property.condition && (
            <div className="flex items-center gap-2 text-slate-700">
              <Award className="w-3.5 h-3.5 stroke-[2] text-slate-500 shrink-0" />
              <span>
                {t("condition")}: {property.condition}
              </span>
            </div>
          )}

          {amenityHashtags && (
            <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-normal">
                {t("features")}:
              </span>
              <span>{amenityHashtags}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
});
