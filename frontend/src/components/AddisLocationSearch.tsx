import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Search,
  MapPin,
  X,
  Loader2,
  Building2,
  Navigation2,
  Crosshair,
} from "lucide-react";
import { findSubCityByCoordinates } from "../utils/addisSubcities.js";
import { useTranslation } from "../hooks/useTranslation.js";
import { type LanguageKey } from "../i18n/translations.js";

export interface AddisPlace {
  id: string;
  name: string;
  subcityOrStreet: string;
  subCity: string;
  lat: number;
  lon: number;
}

// Base configuration using translation keys instead of hardcoded English strings
const POPULAR_ADDIS_LOCATIONS_BASE = [
  {
    id: "p1",
    nameKey: "loc_bole_medhanialem",
    descKey: "desc_bole",
    subCity: "Bole",
    lat: 8.9961,
    lon: 38.7885,
  },
  {
    id: "p2",
    nameKey: "loc_meskel_square",
    descKey: "desc_kirkos",
    subCity: "Kirkos",
    lat: 9.0105,
    lon: 38.7618,
  },
  {
    id: "p3",
    nameKey: "loc_mexico_square",
    descKey: "desc_lideta",
    subCity: "Lideta",
    lat: 9.0125,
    lon: 38.7423,
  },
  {
    id: "p4",
    nameKey: "loc_megenagna",
    descKey: "desc_yeka",
    subCity: "Yeka",
    lat: 9.0207,
    lon: 38.8021,
  },
  {
    id: "p5",
    nameKey: "loc_piazza",
    descKey: "desc_arada",
    subCity: "Arada",
    lat: 9.0345,
    lon: 38.7519,
  },
  {
    id: "p6",
    nameKey: "loc_cmc_michael",
    descKey: "desc_yeka_bole",
    subCity: "Yeka",
    lat: 9.0195,
    lon: 38.8471,
  },
  {
    id: "p7",
    nameKey: "loc_airport",
    descKey: "desc_airport",
    subCity: "Bole",
    lat: 8.9806,
    lon: 38.7994,
  },
  {
    id: "p8",
    nameKey: "loc_sarbet",
    descKey: "desc_nifas_silk",
    subCity: "Nifas Silk-Lafto",
    lat: 9.0001,
    lon: 38.7355,
  },
];

interface Props {
  placeholder?: string;
  value?: string;
  onSelect: (place: AddisPlace) => void;
}

export function AddisLocationSearch({
  placeholder,
  value = "",
  onSelect,
}: Props) {
  const { t } = useTranslation();

  // Dynamically translate the popular locations using the keys in POPULAR_ADDIS_LOCATIONS_BASE
  const localizedPopularLocations: AddisPlace[] = useMemo(() => {
    return POPULAR_ADDIS_LOCATIONS_BASE.map((place) => ({
      id: place.id,
      name: t(place.nameKey as LanguageKey) || place.nameKey,
      subcityOrStreet: t(place.descKey as LanguageKey) || place.descKey,
      subCity: place.subCity,
      lat: place.lat,
      lon: place.lon,
    }));
  }, [t]);

  // Use the prop placeholder if provided, otherwise dynamically translate the default
  const resolvedPlaceholder =
    placeholder || t("locationSearchPlaceholder" as LanguageKey);

  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<AddisPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddis = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const bbox = "38.65,8.83,38.92,9.09";
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        searchTerm,
      )}&bbox=${bbox}&lat=9.0105&lon=38.7618&limit=8`;

      const response = await fetch(url);
      const data = await response.json();

      const mapped: AddisPlace[] = (data.features || []).map(
        (item: any, i: number) => {
          const p = item.properties;
          const lat = item.geometry.coordinates[1];
          const lon = item.geometry.coordinates[0];

          // Mathematical sub-city calculation
          const subCity = findSubCityByCoordinates(lat, lon);

          const subDetails = [
            p.street,
            p.district || p.suburb || `${subCity} Sub-City`,
            p.city || "Addis Ababa",
          ]
            .filter(Boolean)
            .join(", ");

          return {
            id: `${p.osm_id || i}`,
            name: p.name || p.street || "Addis Ababa Location",
            subcityOrStreet: subDetails || "Addis Ababa, Ethiopia",
            subCity,
            lat,
            lon,
          };
        },
      );

      setResults(mapped);
    } catch (err) {
      console.error("Photon Geocoder error:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchAddis(query);
    }, 280);
    return () => clearTimeout(timer);
  }, [query, searchAddis]);

  const handleSelect = (place: AddisPlace) => {
    // Cast window.Telegram.WebApp to 'any' to bypass missing TypeScript definitions for HapticFeedback
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred("medium");
    }

    setQuery(place.name);
    setIsOpen(false);
    onSelect(place);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const subCity = findSubCityByCoordinates(lat, lon);

        const currentPlace: AddisPlace = {
          id: `gps_${Date.now()}`,
          name: query.trim() || t("useCurrentLocation" as LanguageKey),
          subcityOrStreet: `${subCity} Sub-City, Addis Ababa`,
          subCity,
          lat,
          lon,
        };
        setIsLocating(false);
        handleSelect(currentPlace);
      },
      (err) => {
        console.warn("GPS location detection failed:", err);
        setIsLocating(false);
        const subCity = findSubCityByCoordinates(9.0192, 38.7525);
        handleSelect({
          id: "fallback_gps",
          name: query.trim() || "Addis Ababa Center",
          subcityOrStreet: "Addis Ababa, Ethiopia",
          subCity,
          lat: 9.0192,
          lon: 38.7525,
        });
      },
      { timeout: 8000 },
    );
  };

  const clearInput = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative w-full " ref={containerRef}>
      <div className="flex items-center gap-2 bg-slate-100/90 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500 rounded-2xl px-3.5 py-2.5 transition-all border border-slate-200/80 shadow-xs">
        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={resolvedPlaceholder}
          className="w-full bg-transparent text-xs font-bold text-slate-800 placeholder-slate-400 outline-none"
        />
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
        ) : query ? (
          <button
            type="button"
            onClick={clearInput}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 divide-y divide-slate-100 animate-in fade-in duration-150">
          <button
            type="button"
            onMouseDown={handleGetCurrentLocation}
            disabled={isLocating}
            className="w-full px-4 py-3 flex items-center gap-3 text-left bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-800 transition-colors font-bold text-xs"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Crosshair className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-emerald-900 leading-tight">
                {t("useCurrentLocation" as LanguageKey)}
              </p>
              <p className="text-[10px] text-emerald-700 font-medium leading-tight mt-0.5">
                {t("detectGps" as LanguageKey)}
              </p>
            </div>
          </button>

          {query.trim().length >= 2 && (
            <button
              type="button"
              onMouseDown={() => {
                const subCity = findSubCityByCoordinates(9.0192, 38.7525);
                handleSelect({
                  id: `custom_${Date.now()}`,
                  name: query.trim(),
                  subcityOrStreet: `${subCity} Sub-City, Addis Ababa`,
                  subCity,
                  lat: 9.0192,
                  lon: 38.7525,
                });
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {t("useCustomName" as LanguageKey)} "{query.trim()}"
                </p>
                <p className="text-[10px] text-slate-400">
                  {t("saveCustomName" as LanguageKey)}
                </p>
              </div>
            </button>
          )}

          <div className="px-4 py-1.5 bg-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>
              {query.length >= 2
                ? t("searchResults" as LanguageKey)
                : t("popularLocations" as LanguageKey)}
            </span>
            <span>{t("addisAbabaOnly" as LanguageKey)}</span>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {(query.length >= 2 ? results : localizedPopularLocations).map(
              (place) => (
                <button
                  key={place.id}
                  type="button"
                  onMouseDown={() => handleSelect(place)}
                  className="w-full px-4 py-2.5 flex items-start gap-3 text-left hover:bg-emerald-50/50 active:bg-emerald-100/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    {query.length >= 2 ? (
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {place.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {place.subcityOrStreet}
                    </p>
                  </div>
                  <Navigation2 className="w-3.5 h-3.5 text-slate-300 -rotate-45 mt-1 shrink-0" />
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
