import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { createPropertyListing } from "../api/properties.js";
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
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const COMMON_AMENITIES = [
  "Parking",
  "Elevator",
  "Backup Generator",
  "Water Tank",
  "Security / CCTV",
  "Balcony",
  "Garden",
  "Furnished",
  "Modern Kitchen",
  "Terrace",
];

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

const FLAT_PUBLICATION_FEE = 150; // Flat fee for all listings

/* Custom Searchable Select Dropdown Component */
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to filter..."
              autoFocus
              className="w-full bg-transparent text-xs font-normal text-slate-800 outline-none placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
  const selectedAmenities = watch("amenities") || [];
  const selectedIsFurnished = watch("isFurnished");

  const isLandCategory = selectedCategory?.includes("LAND");

  const regionOptions = ETHIOPIAN_REGIONS.map((r) => ({ value: r, label: r }));
  const subCityOptions = ADDIS_ABABA_SUBCITIES.map((sc) => ({
    value: sc,
    label: sc,
  }));

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setValue(
        "amenities",
        selectedAmenities.filter((a: string) => a !== amenity),
      );
    } else {
      setValue("amenities", [...selectedAmenities, amenity]);
    }
  };

  const onFormSubmit = handleSubmit(async (data: any) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload: CreatePropertyInput = {
        ...data,
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

      await createPropertyListing(payload);
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

      <form onSubmit={onFormSubmit} className="space-y-3.5">
        {/* Purpose Chips - Single Row Horizontal Scroll */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Listing Purpose *
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                    className={`w-3.5 h-3.5 ${
                      isSelected ? "text-white" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Property Category - Custom Searchable Select */}
        <CustomSearchSelect
          label="Property Category *"
          options={CATEGORY_OPTIONS}
          value={selectedCategory}
          onChange={(val) => setValue("category", val)}
          placeholder="Select Category..."
          error={errors.category?.message as string}
        />

        {/* Provider Type Chips - Single Row Horizontal Scroll */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Your Listing Provider Type *
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

        {/* Titles & Pricing Card */}
        <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Property Title (English) *
            </label>
            <input
              type="text"
              {...register("titleEn")}
              placeholder="E.g., Modern 3 Bedroom Apartment in Bole Atlas"
              className={`w-full h-9 px-3 text-xs bg-white border rounded-lg font-normal focus:outline-none ${
                errors.titleEn
                  ? "border-red-400 bg-red-50/20"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {errors.titleEn && (
              <p className="text-[10px] text-red-600 font-medium mt-0.5">
                {String(errors.titleEn.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Property Title (Amharic) *
            </label>
            <input
              type="text"
              {...register("titleAm")}
              placeholder="ምሳሌ፦ በቦሌ አትላስ ዘመናዊ የ 3 መኝታ አፓርትመንት"
              className={`w-full h-9 px-3 text-xs bg-white border rounded-lg font-normal focus:outline-none ${
                errors.titleAm
                  ? "border-red-400 bg-red-50/20"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {errors.titleAm && (
              <p className="text-[10px] text-red-600 font-medium mt-0.5">
                {String(errors.titleAm.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Price (ETB) *
            </label>
            <input
              type="number"
              {...register("priceETB", { valueAsNumber: true })}
              className={`w-full h-9 px-3 text-xs bg-white border rounded-lg font-semibold text-emerald-700 focus:outline-none ${
                errors.priceETB
                  ? "border-red-400"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {errors.priceETB && (
              <p className="text-[10px] text-red-600 font-medium mt-0.5">
                {String(errors.priceETB.message)}
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Property Attributes */}
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

            {/* Furnished Toggle Switch */}
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

            {/* Amenities - Wrapped Multi-Row Grid */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Amenities
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_AMENITIES.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {amenity}
                    </button>
                  );
                })}
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
              placeholder="Landmark, condition, utilities details..."
              className={`w-full px-3 py-2 text-xs bg-white border rounded-lg font-normal focus:outline-none ${
                errors.descriptionEn
                  ? "border-red-400 bg-red-50/20"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {errors.descriptionEn && (
              <p className="text-[10px] text-red-600 font-medium mt-0.5">
                {String(errors.descriptionEn.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description (Amharic) *
            </label>
            <textarea
              rows={2}
              {...register("descriptionAm")}
              placeholder="ስለ ንብረቱ ዝርዝር መረጃ ያስገቡ..."
              className={`w-full px-3 py-2 text-xs bg-white border rounded-lg font-normal focus:outline-none ${
                errors.descriptionAm
                  ? "border-red-400 bg-red-50/20"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {errors.descriptionAm && (
              <p className="text-[10px] text-red-600 font-medium mt-0.5">
                {String(errors.descriptionAm.message)}
              </p>
            )}
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
              placeholder="E.g., Bole Atlas, CMC, Sarbet"
              className={`w-full h-9 px-3 text-xs bg-white border rounded-lg font-normal focus:outline-none ${
                errors.areaName
                  ? "border-red-400 bg-red-50/20"
                  : "border-slate-200 focus:border-emerald-500"
              }`}
            />
            {errors.areaName && (
              <p className="text-[10px] text-red-600 font-medium mt-0.5">
                {String(errors.areaName.message)}
              </p>
            )}
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
            Submitting creates a draft in your portfolio. You can upload photos
            and complete checkout to publish live.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {isSubmitting ? "Creating Draft..." : "Create Draft & Continue"}
          </span>
        </button>
      </form>
    </div>
  );
}
