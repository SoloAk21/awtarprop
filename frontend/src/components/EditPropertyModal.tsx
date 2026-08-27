import React, { useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "../hooks/useTranslation.js";
import {
  updatePropertyListing,
  uploadPropertyImages,
  deletePropertyImage,
} from "../api/properties.js";
import { generateAiAd } from "../api/ai.ts";
import { SocialFeedPost } from "./SocialFeedPost.js";
import { LocationPickerMap } from "./LocationPickerMap.js";
import { AddisLocationSearch, type AddisPlace } from "./AddisLocationSearch.js";
import {
  detectAddisSubCity,
  reverseGeocodeAddis,
} from "../utils/locationUtils.js";
import { stripEmojis } from "../utils/sanitize.js";
import { ADDIS_ABABA_SUBCITIES } from "@awtarprop/shared";
import {
  X,
  CheckCircle2,
  Loader2,
  Pencil,
  AlertCircle,
  Camera,
  Hash,
  Sparkles,
  Wand2,
  Eye,
  Home,
  Key,
  Search,
  Tag,
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

export interface EditPropertyModalProps {
  property: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPropertyModal({
  property,
  onClose,
  onSuccess,
}: EditPropertyModalProps) {
  const { currentLanguage } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Existing Cloudinary Photos
  const [existingImages, setExistingImages] = useState<any[]>(
    property.images || [],
  );

  // New Upload Photos
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Prompt
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Tag Input
  const [tagInput, setTagInput] = useState("");

  const { register, handleSubmit, watch, setValue } = useForm<any>({
    defaultValues: {
      titleEn: property.titleEn || "",
      titleAm: property.titleAm || "",
      descriptionEn: property.descriptionEn || "",
      descriptionAm: property.descriptionAm || "",
      priceETB: Number(property.priceETB) || 0,
      category: property.category || "APARTMENT",
      purpose: property.purpose || "FOR_SALE",
      providerType: property.providerType || "OWNER",
      region: property.region || "Addis Ababa",
      subCity: property.subCity || "Bole",
      areaName: property.areaName || "",
      bedrooms: property.bedrooms || 2,
      bathrooms: property.bathrooms || 2,
      areaSqMeters: property.areaSqMeters || 120,
      isFurnished: Boolean(property.isFurnished),
      condition: property.condition || "EXCELLENT",
      amenities: property.amenities || ["Parking", "Water Tank"],
      latitude: property.latitude || 9.0192,
      longitude: property.longitude || 38.7525,
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

  // Delete existing Cloudinary photo
  const handleDeleteExistingImage = async (imageId: string) => {
    try {
      await deletePropertyImage(property.id, imageId);
      setExistingImages(existingImages.filter((img) => img.id !== imageId));
    } catch (err) {
      alert("Failed to delete image.");
    }
  };

  // Handle new photo selection
  const handleNewPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalAllowed = 5 - existingImages.length;
      const combined = [...newPhotos, ...files].slice(0, totalAllowed);
      setNewPhotos(combined);

      const previews = combined.map((f) => URL.createObjectURL(f));
      setNewPhotoPreviews(previews);
    }
  };

  const removeNewPhoto = (index: number) => {
    const updatedFiles = newPhotos.filter((_, i) => i !== index);
    const updatedPreviews = newPhotoPreviews.filter((_, i) => i !== index);
    setNewPhotos(updatedFiles);
    setNewPhotoPreviews(updatedPreviews);
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
      selectedAmenities.filter((a: string) => a !== tagToRemove),
    );
  };

  const handleAddisPlaceSelect = (place: AddisPlace) => {
    setValue("areaName", place.name);
    setValue("latitude", place.lat);
    setValue("longitude", place.lon);
    if (place.subCity) setValue("subCity", place.subCity);
  };

  const handleMapLocationSelect = async (lat: number, lng: number) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
    try {
      const geo = await reverseGeocodeAddis(lat, lng);
      if (geo.name) setValue("areaName", stripEmojis(geo.name));
      if (geo.subCity) setValue("subCity", geo.subCity);
    } catch (e) {}
  };

  const handleGenerateAiAd = async () => {
    if (!aiPrompt || aiPrompt.trim().length < 5) return;
    setIsAiGenerating(true);
    try {
      const result = await generateAiAd(
        aiPrompt,
        currentLanguage === "AM" ? "AM" : "EN",
      );
      setValue("titleEn", stripEmojis(result.titleEn));
      setValue("titleAm", stripEmojis(result.titleAm));
      setValue("descriptionEn", stripEmojis(result.descriptionEn));
      setValue("descriptionAm", stripEmojis(result.descriptionAm));
      setValue("category", result.category);
      setValue("purpose", result.purpose);
      setValue("priceETB", result.priceETB);
      if (result.areaName) setValue("areaName", stripEmojis(result.areaName));
      if (result.subCity) setValue("subCity", result.subCity);
      if (result.bedrooms) setValue("bedrooms", result.bedrooms);
      if (result.bathrooms) setValue("bathrooms", result.bathrooms);
      if (result.areaSqMeters) setValue("areaSqMeters", result.areaSqMeters);
      if (result.isFurnished !== undefined)
        setValue("isFurnished", result.isFurnished);
      if (result.amenities) setValue("amenities", result.amenities);
    } catch (e) {
      setError("AI generation failed.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const onFormSubmit = handleSubmit(async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updatePropertyListing(property.id, {
        titleEn: stripEmojis(data.titleEn),
        titleAm: stripEmojis(data.titleAm),
        descriptionEn: stripEmojis(data.descriptionEn),
        descriptionAm: stripEmojis(data.descriptionAm),
        category: data.category,
        purpose: data.purpose,
        providerType: data.providerType,
        priceETB: Number(data.priceETB),
        region: "Addis Ababa",
        subCity: data.subCity,
        areaName: stripEmojis(data.areaName),
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
        isFurnished: data.isFurnished,
        condition: data.condition,
        amenities: data.amenities,
        latitude: data.latitude,
        longitude: data.longitude,
      });

      // Upload newly selected photos
      if (newPhotos.length > 0) {
        const formData = new FormData();
        newPhotos.forEach((file) => formData.append("photos", file));
        await uploadPropertyImages(property.id, formData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update property listing",
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  const livePreviewProperty = useMemo(() => {
    const allImgs = [
      ...existingImages,
      ...newPhotoPreviews.map((url, i) => ({ id: `new_${i}`, url })),
    ];

    return {
      ...property,
      titleEn: selectedTitleEn,
      titleAm: selectedTitleAm,
      descriptionEn: selectedDescEn,
      descriptionAm: selectedDescAm,
      category: selectedCategory,
      purpose: selectedPurpose,
      priceETB: selectedPriceETB,
      bedrooms: selectedBedrooms,
      bathrooms: selectedBathrooms,
      areaSqMeters: selectedAreaSqMeters,
      isFurnished: selectedIsFurnished,
      condition: selectedCondition,
      amenities: selectedAmenities,
      subCity: selectedSubCity,
      areaName: selectedAreaName,
      providerType: selectedProviderType,
      images: allImgs,
    };
  }, [
    property,
    selectedTitleEn,
    selectedTitleAm,
    selectedDescEn,
    selectedDescAm,
    selectedCategory,
    selectedPurpose,
    selectedPriceETB,
    selectedBedrooms,
    selectedBathrooms,
    selectedAreaSqMeters,
    selectedIsFurnished,
    selectedCondition,
    selectedAmenities,
    selectedSubCity,
    selectedAreaName,
    selectedProviderType,
    existingImages,
    newPhotoPreviews,
  ]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl p-4 space-y-4 overflow-y-auto animate-in slide-in-from-bottom duration-200 text-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Full Edit Property Listing
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-slate-100 rounded-full text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-normal">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* AI GENERATOR */}
        <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Copywriter Refinement</span>
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(stripEmojis(e.target.value))}
              placeholder="Refine listing with prompt..."
              className="flex-1 text-xs p-2 bg-white/10 border border-white/20 rounded-xl text-white outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={handleGenerateAiAd}
              disabled={isAiGenerating}
              className="px-3 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0"
            >
              {isAiGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5" />
              )}
              <span>AI</span>
            </button>
          </div>
        </div>

        <form onSubmit={onFormSubmit} className="space-y-3.5 text-xs">
          {/* Purpose Chips */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Listing Purpose *
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PURPOSE_OPTIONS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedPurpose === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setValue("purpose", item.id as any)}
                    className={`px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1 shrink-0 ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
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

          {/* Category Select */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Property Category *
            </label>
            <select
              {...register("category")}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Provider Type */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Listing Provider Type *
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PROVIDER_OPTIONS.map((item) => {
                const isSelected = selectedProviderType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setValue("providerType", item.id as any)}
                    className={`px-3 py-1.5 rounded-lg border font-bold transition-all shrink-0 ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* EXISTING & NEW PHOTOS MANAGEMENT */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-700">
              <span>
                Property Photos ({existingImages.length + newPhotos.length}/5)
              </span>
              <span className="text-[10px] font-normal text-slate-400">
                JPEG, PNG, WebP
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleNewPhotoSelect}
              className="hidden"
            />

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {/* Existing Cloudinary Photos */}
              {existingImages.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-lg overflow-hidden border border-slate-200"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(img.id)}
                    className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded-full hover:bg-red-700"
                    title="Delete photo"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}

              {/* New Photos Selected */}
              {newPhotoPreviews.map((url, idx) => (
                <div
                  key={url}
                  className="relative aspect-square rounded-lg overflow-hidden border border-emerald-300"
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewPhoto(idx)}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white p-0.5 rounded-full hover:bg-black/80"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}

              {existingImages.length + newPhotos.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600"
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-[8px] font-bold mt-0.5">Add</span>
                </button>
              )}
            </div>
          </div>

          {/* Titles & Pricing */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Title (English) *
              </label>
              <input
                type="text"
                {...register("titleEn")}
                onChange={(e) =>
                  setValue("titleEn", stripEmojis(e.target.value))
                }
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg font-medium outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Title (Amharic) *
              </label>
              <input
                type="text"
                {...register("titleAm")}
                onChange={(e) =>
                  setValue("titleAm", stripEmojis(e.target.value))
                }
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg font-medium outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Price (ETB) *
              </label>
              <input
                type="number"
                {...register("priceETB", { valueAsNumber: true })}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg font-bold text-emerald-700 outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Specs & Furnished */}
          {!isLandCategory && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Beds
                  </label>
                  <input
                    type="number"
                    {...register("bedrooms", { valueAsNumber: true })}
                    className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg font-bold text-center"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Baths
                  </label>
                  <input
                    type="number"
                    {...register("bathrooms", { valueAsNumber: true })}
                    className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg font-bold text-center"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Area m²
                  </label>
                  <input
                    type="number"
                    {...register("areaSqMeters", { valueAsNumber: true })}
                    className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg font-bold text-center"
                  />
                </div>
              </div>

              {/* Furnished Toggle */}
              <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700">Is Furnished?</span>
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

              {/* Hashtag Amenities Input */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  Amenities (#Hashtags)
                </label>
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
                      placeholder="Type hashtag..."
                      className="w-full h-8 pl-8 pr-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddHashtag()}
                    className="px-3 h-8 bg-slate-200 text-slate-800 font-bold rounded-lg text-xs"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedAmenities.map((tag: string) => (
                    <span
                      key={tag}
                      className="font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-1 text-[11px]"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeHashtag(tag)}
                        className="text-emerald-600"
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
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Description (English) *
              </label>
              <textarea
                rows={2}
                {...register("descriptionEn")}
                onChange={(e) =>
                  setValue("descriptionEn", stripEmojis(e.target.value))
                }
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-normal outline-none focus:border-emerald-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Description (Amharic) *
              </label>
              <textarea
                rows={2}
                {...register("descriptionAm")}
                onChange={(e) =>
                  setValue("descriptionAm", stripEmojis(e.target.value))
                }
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-normal outline-none focus:border-emerald-500 resize-none"
                required
              />
            </div>
          </div>

          {/* Location & Map Picker */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Location Search (Addis Ababa)
              </label>
              <AddisLocationSearch
                value={selectedAreaName}
                onSelect={(place) => {
                  setValue("areaName", place.name);
                  setValue("latitude", place.lat);
                  setValue("longitude", place.lon);
                  if (place.subCity) setValue("subCity", place.subCity);
                }}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Sub-city
              </label>
              <select
                {...register("subCity")}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
              >
                {ADDIS_ABABA_SUBCITIES.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>

            <LocationPickerMap
              initialLat={selectedLatitude || 9.0192}
              initialLng={selectedLongitude || 38.7525}
              onSelectLocation={handleMapLocationSelect}
            />
          </div>

          {/* Live Post Feed Preview */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between px-1 font-bold text-slate-900">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Live Feed Edit Preview</span>
              </span>
            </div>

            <div className="border-2 border-emerald-500/30 rounded-2xl overflow-hidden bg-white shadow-xs">
              <SocialFeedPost
                property={livePreviewProperty}
                onOpenImageIndex={() => {}}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
