import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useTranslation } from "../hooks/useTranslation.js";
import { type LanguageKey } from "../i18n/translations.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { useFavoritesStore } from "../store/useFavoritesStore.js";
import { MultiImageGrid } from "./MultiImageGrid.js";
import { EditPropertyModal } from "./EditPropertyModal.js";
import { useViewTracker } from "../hooks/useViewTracker.js";
import { toast } from "sonner";
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
  Pencil,
  Copy,
  Flag,
  History,
} from "lucide-react";

export interface SocialFeedPostProps {
  property: any;
  onOpenImageIndex: (property: any, imageIndex: number) => void;
  onOpenDetails?: (property: any) => void;
}

function formatTimeAgo(
  dateString?: string,
  t?: (key: LanguageKey) => string,
  isAmharic = false,
): string {
  if (!dateString)
    return t ? t("justNow" as LanguageKey) : isAmharic ? "አሁን" : "Just now";

  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1)
    return t ? t("justNow" as LanguageKey) : isAmharic ? "አሁን" : "Just now";

  if (diffMins < 60) {
    return isAmharic
      ? `ከ ${diffMins} ${t ? t("minutesAgo" as LanguageKey) : "ደቂቃ በፊት"}`
      : `${diffMins}m ago`;
  }

  if (diffHours < 24) {
    return isAmharic
      ? `ከ ${diffHours} ${t ? t("hoursAgo" as LanguageKey) : "ሰዓት በፊት"}`
      : `${diffHours}h ago`;
  }

  if (diffDays < 7) {
    return isAmharic
      ? `ከ ${diffDays} ${t ? t("daysAgo" as LanguageKey) : "ቀን በፊት"}`
      : `${diffDays}d ago`;
  }

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

  const user = useAuthStore((state) => state.user);
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Attach view tracking ref
  const viewTrackingRef = useViewTracker(property.id);

  const isOwner = useMemo(() => {
    if (!user) return false;

    return (
      user.id === property.providerId ||
      String(user.telegramId) === String(property.provider?.telegramId)
    );
  }, [user, property.providerId, property.provider?.telegramId]);

  const isEdited = useMemo(() => {
    if (!property.createdAt || !property.updatedAt) return false;

    return (
      new Date(property.updatedAt).getTime() -
        new Date(property.createdAt).getTime() >
      60000
    );
  }, [property.createdAt, property.updatedAt]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowOptionsMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      setShowOptionsMenu(false);

      const shareText = encodeURIComponent(
        `${title} - ${formatCurrency(Number(property.priceETB))}`,
      );

      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
        window.location.origin,
      )}&text=${shareText}`;

      if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(shareUrl);
      } else {
        window.open(shareUrl, "_blank");
      }
    },
    [property.priceETB, title, formatCurrency],
  );

  const handleOpenMapLocation = (e: React.MouseEvent) => {
    e.stopPropagation();

    const mapUrl =
      property.latitude && property.longitude
        ? `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${property.areaName}, ${property.subCity || ""}, ${
              property.region
            }`,
          )}`;

    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(mapUrl);
    } else {
      window.open(mapUrl, "_blank");
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptionsMenu(false);

    const shareUrl = `${window.location.origin}?startapp=prop_${property.id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("linkCopied" as LanguageKey));
    } catch {
      toast.error(t("copyLinkFailed" as LanguageKey));
    }
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptionsMenu(false);
    toast.success(t("reportSubmitted" as LanguageKey));
  };

  const telegramUsername = property.provider?.username;
  const contactPhone = property.provider?.phoneNumber;

  const timeAgoText = useMemo(
    () => formatTimeAgo(property.createdAt, t, isAmharic),
    [property.createdAt, t, isAmharic],
  );

  return (
    <article
      ref={viewTrackingRef as React.RefObject<HTMLDivElement>}
      className="bg-white border-b border-slate-100 pb-3 mb-2 relative"
    >
      {/* USER / PROVIDER HEADER */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0 relative">
            {property.provider?.firstName?.charAt(0) || "U"}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900 text-xs leading-none">
                {property.provider?.firstName}{" "}
                {property.provider?.lastName || ""}
              </h4>

              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />

              <span className="text-[9px] font-extrabold bg-slate-100 text-slate-700 px-1.5 py-0.25 rounded uppercase">
                {translateProviderType(property.providerType)}
              </span>

              {isEdited && (
                <span className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1 py-0.25 rounded flex items-center gap-0.5">
                  <History className="w-2.5 h-2.5 text-slate-400" />
                  <span>{t("edited" as LanguageKey)}</span>
                </span>
              )}
            </div>

            <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">
              @{property.provider?.username || "user"} • {timeAgoText}
            </p>
          </div>
        </div>

        {/* OPTIONS MENU */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowOptionsMenu((prev) => !prev);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showOptionsMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-40 text-xs font-semibold text-slate-800 divide-y divide-slate-100 animate-in fade-in duration-100">
              {isOwner && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptionsMenu(false);
                    setShowEditModal(true);
                  }}
                  className="w-full px-3.5 py-2.5 text-left flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{t("editListing" as LanguageKey)}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="w-full px-3.5 py-2.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t("shareListing" as LanguageKey)}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full px-3.5 py-2.5 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t("copyLink" as LanguageKey)}</span>
              </button>

              {!isOwner && (
                <button
                  type="button"
                  onClick={handleReport}
                  className="w-full px-3.5 py-2.5 text-left flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{t("reportListing" as LanguageKey)}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MULTI-PHOTO COLLAGE */}
      <MultiImageGrid
        images={images}
        onImageClick={(index) => onOpenImageIndex(property, index)}
      />

      {/* ACTION BAR */}
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
            title={favorited ? t("saved") : t("save")}
          >
            <Bookmark
              className={`w-4 h-4 stroke-[2] ${
                favorited ? "fill-emerald-600 text-emerald-600" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* CAPTION SECTION */}
      <div className="px-4 pt-2.5 space-y-2.5">
        <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
          {title}
        </h3>

        <div className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-line">
          <span>{displayText}</span>

          {shouldTruncate && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="ml-1 text-emerald-600 font-bold hover:underline"
            >
              {isExpanded ? t("less") : t("more")}
            </button>
          )}
        </div>

        {/* SPECIFICATIONS */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold">
            <Tag className="w-3.5 h-3.5 stroke-[2] text-emerald-600 shrink-0" />

            <span>
              {translatePurpose(property.purpose)} ·{" "}
              {translateCategory(property.category)} ·{" "}
              {formatCurrency(Number(property.priceETB))}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenMapLocation}
            className="flex items-center gap-2 text-slate-700 font-semibold hover:text-emerald-700 text-left transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 stroke-[2] text-emerald-500 shrink-0" />

            <span className="underline decoration-dotted underline-offset-2">
              {property.areaName},{" "}
              {property.subCity ? `${property.subCity}, ` : ""}
              {property.region}
            </span>
          </button>

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
              <div className="flex items-center gap-1.5 text-slate-700">
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

      {/* EDIT PROPERTY MODAL */}
      {showEditModal && (
        <EditPropertyModal
          property={property}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </article>
  );
});
