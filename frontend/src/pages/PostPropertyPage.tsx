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
import { stripEmojis } from "../utils/sanitize.js";
import {
  ETHIOPIAN_REGIONS,
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative space-y-1 w-full" ref={containerRef}>
      <label className="block text-xs font-medium text-slate-700">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-9 px-3 bg-slate-50 border text-xs font-medium text-slate-800 rounded-lg flex items-center justify-between transition-all ${
          error
            ? "border-red-400 bg-red-50/20"
            : isOpen
              ? "border-emerald-500 ring-1 ring-emerald-500 bg-white"
              : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
            isOpen ? "rotate-180 text-emerald-600" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden text-xs animate-in fade-in duration-100">
          <div className="p-1.5 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
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
                className="p-0.5 hover:bg-slate-200 rounded text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto py-1 divide-y divide-slate-50 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-800 font-semibold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">
                No matching results
              </div>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-[10px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export function PostPropertyPage() {
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // AI Generator States
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);
  const [reviewTab, setReviewTab] = useState<"EN" | "AM">(
    currentLanguage === "AM" ? "AM" : "EN",
  );

  // TikTok-style Hashtag Input State
  const [tagInput, setTagInput] = useState("");

  // Photo Upload State
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
      providerType: (user?.providerType as any) || "OWNER",
      region: "Addis Ababa",
      subCity: "Bole",
      areaName: "",
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
    },
  });

  const selectedPurpose = watch("purpose");
  const selectedCategory = watch("category");
  const selectedProviderType = watch("providerType");
  const selectedRegion = watch("region");
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

  const isLandCategory = selectedCategory?.includes("LAND");

  const regionOptions = ETHIOPIAN_REGIONS.map((r) => ({ value: r, label: r }));
  const subCityOptions = ADDIS_ABABA_SUBCITIES.map((sc) => ({
    value: sc,
    label: sc,
  }));

  // Handle TikTok-style Hashtag Add
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
      selectedAmenities.filter((a: string) => a !== tagToRemove),
    );
  };

  // AI Prompt Ad Generator
  const handleGenerateAiAd = async (promptToUse?: string) => {
    const textPrompt = stripEmojis(promptToUse || aiPrompt);
    if (!textPrompt || textPrompt.trim().length < 5) return;

    setIsAiGenerating(true);
    setSubmitError(null);
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
      setValue("region", result.region);
      if (result.subCity) setValue("subCity", result.subCity);
      if (result.areaName) setValue("areaName", stripEmojis(result.areaName));
      if (result.bedrooms) setValue("bedrooms", result.bedrooms);
      if (result.bathrooms) setValue("bathrooms", result.bathrooms);
      if (result.areaSqMeters) setValue("areaSqMeters", result.areaSqMeters);

      // Auto toggle furnished based on AI detection
      if (result.isFurnished !== undefined) {
        setValue("isFurnished", result.isFurnished);
      }

      if (result.amenities) setValue("amenities", result.amenities);

      setAiGeneratedSuccess(true);
      setReviewTab(currentLanguage === "AM" ? "AM" : "EN");
    } catch (err: any) {
      setSubmitError(
        "AI generation failed. Please review your prompt or enter details manually.",
      );
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const combinedFiles = [...selectedPhotos, ...newFiles].slice(0, 5);
      setSelectedPhotos(combinedFiles);

      const newPreviews = combinedFiles.map((file) =>
        URL.createObjectURL(file),
      );
      setPhotoPreviews(newPreviews);
    }
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
        titleEn: stripEmojis(data.titleEn),
        titleAm: stripEmojis(data.titleAm),
        descriptionEn: stripEmojis(data.descriptionEn),
        descriptionAm: stripEmojis(data.descriptionAm),
        areaName: stripEmojis(data.areaName),
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
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message ||
          "Failed to create property listing draft",
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  // Construct Live Feed Card Preview Object
  const livePreviewProperty = useMemo(() => {
    const mockImages = photoPreviews.map((url, idx) => ({
      id: `preview_${idx}`,
      url,
      isMain: idx === 0,
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
      region: selectedRegion,
      subCity: selectedSubCity,
      areaName: selectedAreaName || "Landmark Area",
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
    selectedRegion,
    selectedSubCity,
    selectedAreaName,
    selectedProviderType,
    photoPreviews,
    user,
  ]);

  return (
    <div className="w-full max-w-md mx-auto p-3.5 pb-24 space-y-4 text-slate-800 overflow-x-hidden">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <PlusCircle className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-semibold text-slate-800">
            {t("navPost")}
          </h2>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100/60">
          {FLAT_PUBLICATION_FEE} ETB Fee
        </span>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-lg text-xs flex items-center gap-2 font-normal">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* PROMPT-FIRST AI GENERATOR CONTAINER */}
      <div className="p-3.5 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-extrabold tracking-tight">
              AI Bilingual Ad Generator
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30">
            Gemini AI
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
          Enter property requirements naturally. Gemini auto-detects furnished
          state, pricing, and generates bilingual ads.
        </p>

        <div className="space-y-2">
          <textarea
            rows={3}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(stripEmojis(e.target.value))}
            placeholder="E.g., 3 bedroom furnished apartment in Bole Atlas for rent 80k ETB with generator & water tank..."
            className="w-full text-xs p-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 font-normal resize-none"
          />

          {/* Quick Example Prompt Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setAiPrompt(ex);
                  handleGenerateAiAd(ex);
                }}
                className="text-[10px] font-medium px-2.5 py-1 bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/10 rounded-lg whitespace-nowrap shrink-0 transition-colors"
              >
                {ex.slice(0, 35)}...
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleGenerateAiAd()}
            disabled={isAiGenerating || aiPrompt.trim().length < 5}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-xs"
          >
            {isAiGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Bilingual Ad...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate Ad with Gemini AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={onFormSubmit} className="space-y-3.5">
        {/* Purpose Chips */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Listing Purpose *
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 whitespace-nowrap scrollbar-none">
            {PURPOSE_OPTIONS.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedPurpose === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setValue("purpose", item.id as any)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                      : "border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-400"}`}
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
          onChange={(val) => setValue("category", val)}
          placeholder="Select Category..."
          error={errors.category?.message as string}
        />

        {/* Provider Type */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Your Listing Provider Type *
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 whitespace-nowrap scrollbar-none">
            {PROVIDER_OPTIONS.map((item) => {
              const isSelected = selectedProviderType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setValue("providerType", item.id as any)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shrink-0 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600 font-semibold"
                      : "border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MULTI-PHOTO UPLOAD SECTION */}
        <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-700">
              Property Photos ({selectedPhotos.length}/5)
            </label>
            <span className="text-[10px] text-slate-400 font-normal">
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
            {photoPreviews.map((url, idx) => (
              <div
                key={url}
                className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group"
              >
                <img
                  src={url}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-0.5 right-0.75 bg-black/60 text-white p-0.5 rounded-full hover:bg-black/80"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[8px] font-bold text-center py-0.25">
                    Main
                  </span>
                )}
              </div>
            ))}

            {selectedPhotos.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span className="text-[9px] font-medium mt-0.5">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Titles & Pricing Card */}
        <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Property Title (English) *
            </label>
            <input
              type="text"
              {...register("titleEn")}
              onChange={(e) => setValue("titleEn", stripEmojis(e.target.value))}
              placeholder="E.g., Modern 3 Bedroom Apartment in Bole Atlas"
              className={`w-full h-9 px-3 text-xs bg-white border rounded-lg font-normal focus:outline-none ${
                errors.titleEn
                  ? "border-red-400 bg-red-50/20"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Property Title (Amharic) *
            </label>
            <input
              type="text"
              {...register("titleAm")}
              onChange={(e) => setValue("titleAm", stripEmojis(e.target.value))}
              placeholder="ምሳሌ፦ በቦሌ አትላስ ዘመናዊ የ 3 መኝታ አፓርትመንት"
              className={`w-full h-9 px-3 text-xs bg-white border rounded-lg font-normal focus:outline-none ${
                errors.titleAm
                  ? "border-red-400 bg-red-50/20"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Price (ETB) *
            </label>
            <input
              type="number"
              {...register("priceETB", { valueAsNumber: true })}
              className="w-full h-9 px-3 text-xs bg-white border rounded-lg font-semibold text-emerald-700 focus:outline-none border-slate-200 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Specs & Furnished Toggle */}
        {!isLandCategory && (
          <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  {...register("bedrooms", { valueAsNumber: true })}
                  className="w-full h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg font-semibold text-center focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  {...register("bathrooms", { valueAsNumber: true })}
                  className="w-full h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg font-semibold text-center focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Area (m²)
                </label>
                <input
                  type="number"
                  {...register("areaSqMeters", { valueAsNumber: true })}
                  className="w-full h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg font-semibold text-center focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Is Furnished Toggle */}
            <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200">
              <span className="text-xs font-medium text-slate-700">
                Is Furnished?
              </span>
              <button
                type="button"
                onClick={() => setValue("isFurnished", !selectedIsFurnished)}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  selectedIsFurnished ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                    selectedIsFurnished ? "right-0.75" : "left-0.75"
                  }`}
                />
              </button>
            </div>

            {/* TIKTOK-STYLE HASHTAG AMENITIES INPUT */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Amenities & Features (#Hashtags)
              </label>

              {/* Tag Input Box */}
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
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
                    className="w-full h-8 pl-8 pr-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddHashtag()}
                  className="px-3 h-8 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs transition-colors"
                >
                  + Add
                </button>
              </div>

              {/* Hashtags Active List */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedAmenities.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-1"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="text-emerald-600 hover:text-emerald-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Descriptions */}
        <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description (English) *
            </label>
            <textarea
              rows={2}
              {...register("descriptionEn")}
              onChange={(e) =>
                setValue("descriptionEn", stripEmojis(e.target.value))
              }
              placeholder="Landmark, condition, utilities details..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-normal focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description (Amharic) *
            </label>
            <textarea
              rows={2}
              {...register("descriptionAm")}
              onChange={(e) =>
                setValue("descriptionAm", stripEmojis(e.target.value))
              }
              placeholder="ስለ ንብረቱ ዝርዝር መረጃ ያስገቡ..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-normal focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3">
          <CustomSearchSelect
            label="Region *"
            options={regionOptions}
            value={selectedRegion}
            onChange={(val) => setValue("region", val)}
            placeholder="Select Region..."
          />

          <CustomSearchSelect
            label="Sub-city (Addis Ababa)"
            options={subCityOptions}
            value={selectedSubCity}
            onChange={(val) => setValue("subCity", val)}
            placeholder="Select Sub-city..."
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Area Name / Landmark *
            </label>
            <input
              type="text"
              {...register("areaName")}
              onChange={(e) =>
                setValue("areaName", stripEmojis(e.target.value))
              }
              placeholder="E.g., Bole Atlas, CMC, Sarbet"
              className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg font-normal focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* LIVE SOCIAL FEED CARD PREVIEW AT THE BOTTOM */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Live Post Feed Preview</span>
            </span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              Real-time Preview
            </span>
          </div>

          <div className="border-2 border-emerald-500/30 rounded-2xl overflow-hidden bg-white shadow-xs">
            <SocialFeedPost
              property={livePreviewProperty}
              onOpenImageIndex={() => {}}
            />
          </div>
        </div>

        {/* Summary Box */}
        <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-950">
              Publication Fee
            </span>
            <span className="text-xs font-bold text-emerald-700">
              {FLAT_PUBLICATION_FEE} ETB
            </span>
          </div>
          <p className="text-[10px] text-emerald-800 leading-normal font-normal">
            Submitting creates a draft in your portfolio with your uploaded
            photos attached.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading & Creating Draft...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
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
