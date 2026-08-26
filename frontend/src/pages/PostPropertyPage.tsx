import React, { useState, useRef, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation.js";
import { useAuthStore } from "../store/useAuthStore.js";
import {
  createPropertyListing,
  uploadPropertyImages,
} from "../api/properties.js";
import { generateAiAd } from "../api/ai.ts";
import { SocialFeedPost } from "../components/SocialFeedPost.js";
import { LocationPickerMap } from "../components/LocationPickerMap.js";
import {
  AddisLocationSearch,
  type AddisPlace,
} from "../components/AddisLocationSearch.js";
import {
  detectAddisSubCity,
  reverseGeocodeAddis,
} from "../utils/locationUtils.js";
import { stripEmojis } from "../utils/sanitize.js";
import {
  ADDIS_ABABA_SUBCITIES,
  propertyListingSchema,
  type CreatePropertyInput,
} from "@awtarprop/shared";
import {
  PlusCircle,
  CheckCircle2,
  Home,
  Key,
  Search,
  Tag,
  AlertTriangle,
  ChevronDown,
  X,
  Check,
  Camera,
  Loader2,
  Sparkles,
  Wand2,
  Hash,
  Eye,
} from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "CONDOMINIUM", label: "Condominium" },
  { value: "RESIDENTIAL_HOUSE", label: "Residential House / Villa" },
  { value: "STUDIO", label: "Studio" },
  { value: "COMMERCIAL_SPACE", label: "Commercial Space / Shop" },
  { value: "OFFICE", label: "Office" },
  { value: "BUILDING", label: "Full Building" },
  { value: "RESIDENTIAL_LAND", label: "Residential Land" },
  { value: "COMMERCIAL_LAND", label: "Commercial Land" },
  { value: "AGRICULTURAL_LAND", label: "Agricultural Land" },
];

const PROVIDER_OPTIONS = [
  { id: "OWNER", label: "Property Owner" },
  { id: "BROKER", label: "Broker / Delala" },
  { id: "AGENT", label: "Real Estate Agent" },
  { id: "AGENCY", label: "Agency" },
  { id: "DEVELOPER", label: "Developer" },
];

const PURPOSE_OPTIONS = [
  { id: "FOR_SALE", label: "For Sale", icon: Home },
  { id: "FOR_RENT", label: "For Rent", icon: Key },
  { id: "LOOKING_TO_BUY", label: "Looking to Buy", icon: Search },
  { id: "LOOKING_TO_RENT", label: "Looking to Rent", icon: Tag },
];

const EXAMPLE_PROMPTS = [
  "3 Bedroom furnished apartment for rent in Bole Atlas 80k ETB with generator & water tank",
  "በሲኤምሲ የ 4 መኝታ ቤት ለሽያጭ 25 ሚሊዮን ብር ከነ እቃው",
  "Studio apartment in Megenagna for rent 25k ETB",
];

const FLAT_PUBLICATION_FEE = 150;

interface SearchSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label: string;
  error?: string;
}

function CustomSearchSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  error,
}: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative w-full space-y-1" ref={containerRef}>
      <label className="block text-xs font-medium text-slate-700">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-9 w-full items-center justify-between rounded-lg border bg-slate-50 px-3 text-xs font-medium text-slate-800 transition-all ${
          error
            ? "border-red-400 bg-red-50/20"
            : isOpen
              ? "border-emerald-500 bg-white ring-1 ring-emerald-500"
              : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
            isOpen ? "rotate-180 text-emerald-600" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-xs shadow-lg">
          <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 p-1.5">
            <Search className="ml-1 h-3.5 w-3.5 shrink-0 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(stripEmojis(e.target.value))}
              placeholder="Type to filter..."
              autoFocus
              className="w-full bg-transparent text-xs font-normal text-slate-800 outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-200"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="max-h-40 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-emerald-50 font-semibold text-emerald-800"
                        : "text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
                    }`}
                  >
                    <span className="truncate">{option.label}</span>

                    {isSelected && (
                      <Check className="ml-1 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-center text-xs text-slate-400">
                No matching results
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[10px] font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function PostPropertyPage() {
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);

  const [tagInput, setTagInput] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(propertyListingSchema),
    mode: "onChange",
    defaultValues: {
      purpose: "FOR_SALE",
      category: "APARTMENT",
      providerType: user?.providerType || "OWNER",
      region: "Addis Ababa",
      subCity: "Bole",
      areaName: "Bole Atlas",
      priceETB: 5000000,
      titleEn: "",
      titleAm: "",
      descriptionEn: "",
      descriptionAm: "",
      bedrooms: 2,
      bathrooms: 2,
      areaSqMeters: 120,
      floors: 1,
      condition: "EXCELLENT",
      isFurnished: false,
      amenities: ["Parking", "Backup Generator", "Water Tank"],
      latitude: 9.0192,
      longitude: 38.7525,
    },
  });

  const selectedPurpose = watch("purpose");
  const selectedCategory = watch("category");
  const selectedProviderType = watch("providerType");
  const selectedSubCity = watch("subCity");
  const selectedAreaName = watch("areaName");
  const selectedPriceETB = watch("priceETB");
  const selectedTitleEn = watch("titleEn");
  const selectedTitleAm = watch("titleAm");
  const selectedDescEn = watch("descriptionEn");
  const selectedDescAm = watch("descriptionAm");
  const selectedBedrooms = watch("bedrooms");
  const selectedBathrooms = watch("bathrooms");
  const selectedAreaSqMeters = watch("areaSqMeters");
  const selectedAmenities = watch("amenities") || [];
  const selectedIsFurnished = watch("isFurnished");
  const selectedCondition = watch("condition");
  const selectedLatitude = watch("latitude");
  const selectedLongitude = watch("longitude");

  const isLandCategory = selectedCategory?.includes("LAND");

  const subCityOptions = ADDIS_ABABA_SUBCITIES.map((subCity) => ({
    value: subCity,
    label: subCity,
  }));

  /**
   * Location search selection
   *
   * Priority:
   * 1. Use subCity directly from AddisPlace if available.
   * 2. Otherwise detect it from the place name/address.
   */
  const handleAddisPlaceSelect = (place: AddisPlace) => {
    setValue("areaName", stripEmojis(place.name));
    setValue("latitude", place.lat);
    setValue("longitude", place.lon);

    // Prefer the sub-city returned by the location search.
    const placeWithSubCity = place as AddisPlace & {
      subCity?: string;
    };

    if (placeWithSubCity.subCity) {
      setValue("subCity", placeWithSubCity.subCity);
      return;
    }

    // Fallback: detect sub-city from the location information.
    const locationText = [place.name, place.subcityOrStreet]
      .filter(Boolean)
      .join(" ");

    const detectedSubCity = detectAddisSubCity(locationText);

    if (detectedSubCity) {
      setValue("subCity", detectedSubCity);
    }
  };

  /**
   * Map pin selection
   *
   * Coordinates are reverse-geocoded to determine:
   * - Area / landmark
   * - Sub-city
   */
  const handleMapLocationSelect = async (lat: number, lng: number) => {
    setValue("latitude", lat);
    setValue("longitude", lng);

    try {
      const geo = await reverseGeocodeAddis(lat, lng);

      // Auto-populate area name from reverse geocoding.
      if (
        geo.name &&
        (!selectedAreaName || selectedAreaName === "Bole Atlas")
      ) {
        setValue("areaName", stripEmojis(geo.name));
      }

      // Auto-populate sub-city from reverse geocoding.
      if (geo.subCity) {
        setValue("subCity", geo.subCity);
      } else if (geo.name) {
        // Final fallback: detect sub-city from returned place name.
        const detectedSubCity = detectAddisSubCity(geo.name);

        if (detectedSubCity) {
          setValue("subCity", detectedSubCity);
        }
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
  };

  const handleAddHashtag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanTag = stripEmojis(tagInput.replace(/#/g, "")).trim();

    if (!cleanTag) return;

    if (!selectedAmenities.includes(cleanTag)) {
      setValue("amenities", [...selectedAmenities, cleanTag]);
    }

    setTagInput("");
  };

  const removeHashtag = (tagToRemove: string) => {
    setValue(
      "amenities",
      selectedAmenities.filter((amenity: string) => amenity !== tagToRemove),
    );
  };

  const handleGenerateAiAd = async (promptToUse?: string) => {
    const textPrompt = stripEmojis(promptToUse || aiPrompt);

    if (!textPrompt || textPrompt.trim().length < 5) return;

    setIsAiGenerating(true);
    setSubmitError(null);
    setAiGeneratedSuccess(false);

    try {
      const result = await generateAiAd(
        textPrompt,
        currentLanguage === "AM" ? "AM" : "EN",
      );

      setValue("titleEn", stripEmojis(result.titleEn));
      setValue("titleAm", stripEmojis(result.titleAm));
      setValue("descriptionEn", stripEmojis(result.descriptionEn));
      setValue("descriptionAm", stripEmojis(result.descriptionAm));

      setValue("category", result.category);
      setValue("purpose", result.purpose);
      setValue("priceETB", result.priceETB);
      setValue("region", "Addis Ababa");

      if (result.areaName) {
        const areaName = stripEmojis(result.areaName);

        setValue("areaName", areaName);

        const detectedSubCity = detectAddisSubCity(areaName);

        if (detectedSubCity) {
          setValue("subCity", detectedSubCity);
        }
      }

      if (result.subCity) {
        setValue("subCity", result.subCity);
      }

      if (result.bedrooms) {
        setValue("bedrooms", result.bedrooms);
      }

      if (result.bathrooms) {
        setValue("bathrooms", result.bathrooms);
      }

      if (result.areaSqMeters) {
        setValue("areaSqMeters", result.areaSqMeters);
      }

      if (result.isFurnished !== undefined) {
        setValue("isFurnished", result.isFurnished);
      }

      if (result.amenities) {
        setValue("amenities", result.amenities);
      }

      setAiGeneratedSuccess(true);
    } catch (error) {
      console.error("AI generation failed:", error);

      setSubmitError(
        "AI generation failed. Please review your prompt or enter the details manually.",
      );
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);

    const combinedFiles = [...selectedPhotos, ...newFiles].slice(0, 5);

    setSelectedPhotos(combinedFiles);

    const newPreviews = combinedFiles.map((file) => URL.createObjectURL(file));

    setPhotoPreviews(newPreviews);

    // Allow selecting the same file again later.
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    const updatedFiles = selectedPhotos.filter((_, i) => i !== index);

    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);

    setSelectedPhotos(updatedFiles);
    setPhotoPreviews(updatedPreviews);
  };

  const onFormSubmit = handleSubmit(async (data: any) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: CreatePropertyInput = {
        ...data,

        region: "Addis Ababa",

        titleEn: stripEmojis(data.titleEn),
        titleAm: stripEmojis(data.titleAm),

        descriptionEn: stripEmojis(data.descriptionEn),
        descriptionAm: stripEmojis(data.descriptionAm),

        areaName: stripEmojis(data.areaName || "Bole Atlas"),

        priceETB: Number(data.priceETB),

        bedrooms: isLandCategory
          ? undefined
          : data.bedrooms
            ? Number(data.bedrooms)
            : undefined,

        bathrooms: isLandCategory
          ? undefined
          : data.bathrooms
            ? Number(data.bathrooms)
            : undefined,

        areaSqMeters: data.areaSqMeters ? Number(data.areaSqMeters) : undefined,
      };

      const property = await createPropertyListing(payload);

      if (selectedPhotos.length > 0) {
        const formData = new FormData();

        selectedPhotos.forEach((file) => {
          formData.append("photos", file);
        });

        await uploadPropertyImages(property.id, formData);
      }

      navigate("/profile");
    } catch (error: any) {
      console.error("Create property failed:", error);

      setSubmitError(
        error?.response?.data?.message ||
          "Failed to create property listing draft.",
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  const livePreviewProperty = useMemo(() => {
    const mockImages = photoPreviews.map((url, index) => ({
      id: `preview_${index}`,
      url,
      isMain: index === 0,
    }));

    return {
      id: "live_preview",

      titleEn: selectedTitleEn || "Property Title in English",

      titleAm: selectedTitleAm || "የቤት ርዕስ በአማርኛ",

      descriptionEn: selectedDescEn || "Description will appear here...",

      descriptionAm: selectedDescAm || "ዝርዝር መረጃ እዚህ ይወጣል...",

      category: selectedCategory,
      purpose: selectedPurpose,
      priceETB: selectedPriceETB || 0,

      areaSqMeters: selectedAreaSqMeters,
      bedrooms: selectedBedrooms,
      bathrooms: selectedBathrooms,

      isFurnished: selectedIsFurnished,
      condition: selectedCondition,

      amenities: selectedAmenities,

      region: "Addis Ababa",
      subCity: selectedSubCity,
      areaName: selectedAreaName || "Bole Atlas",

      latitude: selectedLatitude,
      longitude: selectedLongitude,

      providerType: selectedProviderType,

      viewsCount: 0,

      images: mockImages,

      provider: {
        firstName: user?.firstName || "Valued",
        lastName: user?.lastName || "User",
        username: user?.username || "user",
        phoneNumber: user?.phoneNumber || "+251...",
      },
    };
  }, [
    selectedTitleEn,
    selectedTitleAm,
    selectedDescEn,
    selectedDescAm,
    selectedCategory,
    selectedPurpose,
    selectedPriceETB,
    selectedAreaSqMeters,
    selectedBedrooms,
    selectedBathrooms,
    selectedIsFurnished,
    selectedCondition,
    selectedAmenities,
    selectedSubCity,
    selectedAreaName,
    selectedLatitude,
    selectedLongitude,
    selectedProviderType,
    photoPreviews,
    user,
  ]);

  return (
    <div className="mx-auto w-full max-w-md space-y-4 overflow-x-hidden p-3.5 pb-24 text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <PlusCircle className="h-4 w-4" />
          </div>

          <h2 className="text-xs font-semibold text-slate-800">
            {t("navPost")}
          </h2>
        </div>

        <span className="rounded-full border border-emerald-100/60 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
          {FLAT_PUBLICATION_FEE} ETB Fee
        </span>
      </div>

      {/* Error */}
      {submitError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-normal text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{submitError}</span>
        </div>
      )}

      {/* AI */}
      <div className="space-y-3 rounded-2xl bg-slate-900 p-3.5 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />

            <span className="text-xs font-bold tracking-tight">
              Smart AI Ad Copywriter
            </span>
          </div>

          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            Addis Ababa
          </span>
        </div>

        <p className="text-[11px] font-normal leading-relaxed text-slate-300">
          Type property requirements naturally. The AI auto-detects sub-city,
          furnished state, and auto-populates structured bilingual fields.
        </p>

        <div className="space-y-2">
          <textarea
            rows={2}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(stripEmojis(e.target.value))}
            placeholder="E.g., 3 bedroom furnished apartment in Bole Atlas for rent 80k ETB with generator & water tank..."
            className="w-full resize-none rounded-xl border border-white/20 bg-white/10 p-2.5 text-xs font-normal text-white outline-none placeholder:text-slate-400 focus:border-emerald-400"
          />

          <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-1">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setAiPrompt(example);
                  handleGenerateAiAd(example);
                }}
                className="shrink-0 whitespace-nowrap rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-emerald-200 transition-colors hover:bg-white/20"
              >
                {example.slice(0, 35)}...
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleGenerateAiAd()}
            disabled={isAiGenerating || aiPrompt.trim().length < 5}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2 text-xs font-bold text-slate-950 shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-50"
          >
            {isAiGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Generating Ad...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-3.5 w-3.5" />
                <span>Auto-Generate Ad Fields</span>
              </>
            )}
          </button>

          {aiGeneratedSuccess && (
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              AI generated successfully. Review the fields below.
            </div>
          )}
        </div>
      </div>

      <form onSubmit={onFormSubmit} className="space-y-3.5">
        {/* Purpose */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Listing Purpose *
          </label>

          <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-1">
            {PURPOSE_OPTIONS.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedPurpose === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setValue("purpose", item.id)}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isSelected ? "text-white" : "text-slate-400"
                    }`}
                  />

                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category */}
        <CustomSearchSelect
          label="Property Category *"
          options={CATEGORY_OPTIONS}
          value={selectedCategory}
          onChange={(value) => setValue("category", value)}
          placeholder="Select Category..."
          error={errors.category?.message as string}
        />

        {/* Provider */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Your Listing Provider Type *
          </label>

          <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-1">
            {PROVIDER_OPTIONS.map((item) => {
              const isSelected = selectedProviderType === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setValue("providerType", item.id)}
                  className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50 font-semibold text-emerald-900 ring-1 ring-emerald-600"
                      : "border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-700">
              Property Photos ({selectedPhotos.length}/5)
            </label>

            <span className="text-[10px] font-normal text-slate-400">
              JPEG, PNG, WebP
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {photoPreviews.map((url, index) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                >
                  <X className="h-2.5 w-2.5" />
                </button>

                {index === 0 && (
                  <span className="absolute inset-x-0 bottom-0 bg-emerald-600/90 py-0.5 text-center text-[8px] font-bold text-white">
                    Main
                  </span>
                )}
              </div>
            ))}

            {selectedPhotos.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white text-slate-400 transition-colors hover:border-emerald-500 hover:text-emerald-600"
              >
                <Camera className="h-4 w-4" />
                <span className="mt-0.5 text-[9px] font-medium">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Titles & Price */}
        <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Property Title (English) *
            </label>

            <input
              type="text"
              {...register("titleEn")}
              onChange={(e) => setValue("titleEn", stripEmojis(e.target.value))}
              placeholder="E.g., Modern 3 Bedroom Apartment in Bole Atlas"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Property Title (Amharic) *
            </label>

            <input
              type="text"
              {...register("titleAm")}
              onChange={(e) => setValue("titleAm", stripEmojis(e.target.value))}
              placeholder="ምሳሌ፦ በቦሌ አትላስ ዘመናዊ የ 3 መኝታ አፓርትመንት"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Price (ETB) *
            </label>

            <input
              type="number"
              {...register("priceETB", {
                valueAsNumber: true,
              })}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-emerald-700 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Specifications */}
        {!isLandCategory && (
          <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-medium text-slate-600">
                  Bedrooms
                </label>

                <input
                  type="number"
                  {...register("bedrooms", {
                    valueAsNumber: true,
                  })}
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-center text-xs font-semibold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-medium text-slate-600">
                  Bathrooms
                </label>

                <input
                  type="number"
                  {...register("bathrooms", {
                    valueAsNumber: true,
                  })}
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-center text-xs font-semibold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-medium text-slate-600">
                  Area (m²)
                </label>

                <input
                  type="number"
                  {...register("areaSqMeters", {
                    valueAsNumber: true,
                  })}
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-center text-xs font-semibold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Furnished */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
              <span className="text-xs font-medium text-slate-700">
                Is Furnished?
              </span>

              <button
                type="button"
                onClick={() => setValue("isFurnished", !selectedIsFurnished)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  selectedIsFurnished ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                    selectedIsFurnished ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Amenities */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Amenities & Features (#Hashtags)
              </label>

              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Hash className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(stripEmojis(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        handleAddHashtag();
                      }
                    }}
                    placeholder="Type hashtag e.g. Generator, CCTV..."
                    className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-xs font-medium outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleAddHashtag()}
                  className="h-8 rounded-lg bg-slate-200 px-3 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-300"
                >
                  + Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedAmenities.map((tag: string) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800"
                  >
                    <span>#{tag}</span>

                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="text-emerald-600 hover:text-emerald-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Descriptions */}
        <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Description (English) *
            </label>

            <textarea
              rows={2}
              {...register("descriptionEn")}
              onChange={(e) =>
                setValue("descriptionEn", stripEmojis(e.target.value))
              }
              placeholder="Landmark, condition, utilities details..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Description (Amharic) *
            </label>

            <textarea
              rows={2}
              {...register("descriptionAm")}
              onChange={(e) =>
                setValue("descriptionAm", stripEmojis(e.target.value))
              }
              placeholder="ስለ ንብረቱ ዝርዝር መረጃ ያስገቡ..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Property Location / Landmark Search (Addis Ababa) *
            </label>

            <AddisLocationSearch
              value={selectedAreaName}
              onSelect={handleAddisPlaceSelect}
            />
          </div>

          <CustomSearchSelect
            label="Sub-city (Addis Ababa)"
            options={subCityOptions}
            value={selectedSubCity}
            onChange={(value) => setValue("subCity", value)}
            placeholder="Select Sub-city..."
          />

          <LocationPickerMap
            initialLat={selectedLatitude || 9.0192}
            initialLng={selectedLongitude || 38.7525}
            onSelectLocation={handleMapLocationSelect}
          />
        </div>

        {/* Live Preview */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
              <Eye className="h-4 w-4 text-emerald-600" />
              <span>Live Post Feed Preview</span>
            </span>

            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              Real-time Preview
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-white shadow-sm">
            <SocialFeedPost
              property={livePreviewProperty}
              onOpenImageIndex={() => {}}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1 rounded-xl border border-emerald-200/70 bg-emerald-50/80 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-950">
              Publication Fee
            </span>

            <span className="text-xs font-bold text-emerald-700">
              {FLAT_PUBLICATION_FEE} ETB
            </span>
          </div>

          <p className="text-[10px] font-normal leading-normal text-emerald-800">
            Submitting creates a draft in your portfolio with your uploaded
            photos attached.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading & Creating Draft...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Approve & Create Draft ({selectedPhotos.length} photos)
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
