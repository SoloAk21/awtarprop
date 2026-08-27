import { useState } from "react";
import { useTranslation } from "../hooks/useTranslation.js";
import { type LanguageKey } from "../i18n/translations.js";
import { useFavoritesStore } from "../store/useFavoritesStore.js";
import { usePropertiesQuery } from "../hooks/useProperties.js";
import { SocialFeedPost } from "../components/SocialFeedPost.js";
import { LightBoxModal } from "../components/LightBoxModal.js";
import { Bookmark, Loader2, BookmarkX } from "lucide-react";

export function FavoritesPage() {
  const { t } = useTranslation();
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);

  const { data, isLoading } = usePropertiesQuery({ limit: 50 });
  const allProperties: any[] = data?.properties || [];

  const favoriteProperties = allProperties.filter((p: any) =>
    favoriteIds.includes(p.id),
  );

  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: Array<{ id: string; url: string }>;
    initialIndex: number;
    title: string;
  }>({
    isOpen: false,
    images: [],
    initialIndex: 0,
    title: "",
  });

  const handleOpenImageIndex = (property: any, index: number) => {
    setLightboxState({
      isOpen: true,
      images: property.images || [],
      initialIndex: index,
      title: property.titleEn,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto pb-24 text-slate-800">
      {/* Header Bar */}
      <div className="p-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <Bookmark className="w-4.5 h-4.5 fill-emerald-600 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 leading-none">
              {t("navFavorites")}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">
              {t("bookmarkedSubtitle" as LanguageKey)}
            </p>
          </div>
        </div>
        <span className="text-xs font-black px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
          {favoriteProperties.length} {t("savedCount" as LanguageKey)}
        </span>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-xs font-medium">
            {t("loadingSaved" as LanguageKey)}
          </span>
        </div>
      ) : favoriteProperties.length === 0 ? (
        <div className="p-8 mx-3.5 mt-4 bg-slate-50/50 rounded-2xl text-center border border-slate-100 space-y-2">
          <BookmarkX className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">
            {t("noSavedProperties" as LanguageKey)}
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            {t("noSavedDesc" as LanguageKey)}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 pt-2">
          {favoriteProperties.map((p: any) => (
            <SocialFeedPost
              key={p.id}
              property={p}
              onOpenDetails={() => {}}
              onOpenImageIndex={(property, index) =>
                handleOpenImageIndex(property, index)
              }
            />
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <LightBoxModal
        isOpen={lightboxState.isOpen}
        images={lightboxState.images}
        initialIndex={lightboxState.initialIndex}
        title={lightboxState.title}
        onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
