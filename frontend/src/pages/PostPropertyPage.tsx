import { useState } from "react";
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
  ArrowRight,
  Home,
  Key,
  Search,
  Tag,
  AlertTriangle,
  Check,
} from "lucide-react";

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

export function PostPropertyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
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
  const selectedAmenities = watch("amenities") || [];
  const selectedIsFurnished = watch("isFurnished");

  const isLandCategory = selectedCategory?.includes("LAND");

  // Calculate dynamic publication fee in ETB
  const calculateFee = () => {
    let fee = 100;
    if (selectedProviderType === "BROKER" || selectedProviderType === "AGENT")
      fee = 150;
    if (
      selectedProviderType === "AGENCY" ||
      selectedProviderType === "DEVELOPER"
    )
      fee = 300;
    if (
      isLandCategory ||
      selectedCategory === "BUILDING" ||
      selectedCategory === "HOTEL"
    )
      fee += 100;
    return fee;
  };

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

  // Validate step before proceeding
  const handleNextStep = async (nextStep: number) => {
    let fieldsToValidate: string[] = [];

    if (step === 1) {
      fieldsToValidate = ["purpose", "category", "providerType"];
    } else if (step === 2) {
      fieldsToValidate = [
        "titleEn",
        "titleAm",
        "descriptionEn",
        "descriptionAm",
        "priceETB",
      ];
    }

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setSubmitError(null);
      setStep(nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className="space-y-4 pb-24 p-4 max-w-md mx-auto">
      {/* Header & Step Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {t("navPost")}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Step {step} of 3
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
            {calculateFee()} ETB Fee
          </span>
        </div>

        {/* Step Progress Segment Bar */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? "bg-emerald-600" : "bg-slate-100"
              }`}
            />
          ))}
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-center gap-2 font-medium animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={onFormSubmit} className="space-y-4">
        {/* STEP 1: Purpose, Category & Provider */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Purpose Grid */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
              <label className="block text-xs font-extrabold text-slate-900">
                1. Listing Purpose *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "FOR_SALE", label: "For Sale", icon: Home },
                  { id: "FOR_RENT", label: "For Rent", icon: Key },
                  {
                    id: "LOOKING_TO_BUY",
                    label: "Looking to Buy",
                    icon: Search,
                  },
                  {
                    id: "LOOKING_TO_RENT",
                    label: "Looking to Rent",
                    icon: Tag,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedPurpose === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setValue("purpose", item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/60 text-emerald-900 ring-1 ring-emerald-600"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${isSelected ? "text-emerald-600" : "text-slate-400"}`}
                      />
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Select */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <label className="block text-xs font-extrabold text-slate-900">
                2. Property Category *
              </label>
              <select
                {...register("category")}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="APARTMENT">Apartment</option>
                <option value="CONDOMINIUM">Condominium</option>
                <option value="RESIDENTIAL_HOUSE">
                  Residential House / Villa
                </option>
                <option value="STUDIO">Studio</option>
                <option value="COMMERCIAL_SPACE">
                  Commercial Space / Shop
                </option>
                <option value="OFFICE">Office</option>
                <option value="BUILDING">Full Building</option>
                <option value="RESIDENTIAL_LAND">Residential Land</option>
                <option value="COMMERCIAL_LAND">Commercial Land</option>
                <option value="AGRICULTURAL_LAND">Agricultural Land</option>
              </select>
            </div>

            {/* Provider Type */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
              <label className="block text-xs font-extrabold text-slate-900">
                3. Your Listing Provider Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "OWNER", label: "Property Owner", fee: "100 ETB" },
                  { id: "BROKER", label: "Broker / Delala", fee: "150 ETB" },
                  { id: "AGENT", label: "Real Estate Agent", fee: "150 ETB" },
                  { id: "AGENCY", label: "Agency", fee: "300 ETB" },
                  { id: "DEVELOPER", label: "Developer", fee: "300 ETB" },
                ].map((item) => {
                  const isSelected = selectedProviderType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setValue("providerType", item.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/60 text-emerald-900 ring-1 ring-emerald-600"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{item.label}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        Base Fee: {item.fee}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleNextStep(2)}
              className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <span>Continue to Property Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Titles, Price & Specs */}
        {step === 2 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-1">
                Property Title (English) *
              </label>
              <input
                type="text"
                {...register("titleEn")}
                placeholder="E.g., Modern 3 Bedroom Apartment in Bole Atlas"
                className={`w-full text-xs p-3 bg-slate-50 border rounded-xl font-medium focus:outline-none ${
                  errors.titleEn
                    ? "border-red-400 bg-red-50/30"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
              />
              {errors.titleEn && (
                <p className="text-[10px] font-bold text-red-600 mt-1">
                  {String(errors.titleEn.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-1">
                Property Title (Amharic) *
              </label>
              <input
                type="text"
                {...register("titleAm")}
                placeholder="ምሳሌ፦ በቦሌ አትላስ ዘመናዊ የ 3 መኝታ አፓርትመንት"
                className={`w-full text-xs p-3 bg-slate-50 border rounded-xl font-medium focus:outline-none ${
                  errors.titleAm
                    ? "border-red-400 bg-red-50/30"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
              />
              {errors.titleAm && (
                <p className="text-[10px] font-bold text-red-600 mt-1">
                  {String(errors.titleAm.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-1">
                Price (ETB) *
              </label>
              <input
                type="number"
                {...register("priceETB", { valueAsNumber: true })}
                className={`w-full text-xs p-3 bg-slate-50 border rounded-xl font-black text-emerald-600 text-sm focus:outline-none ${
                  errors.priceETB
                    ? "border-red-400"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
              />
              {errors.priceETB && (
                <p className="text-[10px] font-bold text-red-600 mt-1">
                  {String(errors.priceETB.message)}
                </p>
              )}
            </div>

            {!isLandCategory && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-700 mb-1">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      {...register("bedrooms", { valueAsNumber: true })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-700 mb-1">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      {...register("bathrooms", { valueAsNumber: true })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-700 mb-1">
                      Area (m²)
                    </label>
                    <input
                      type="number"
                      {...register("areaSqMeters", { valueAsNumber: true })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-xs font-extrabold text-slate-800">
                    Is Furnished?
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setValue("isFurnished", !selectedIsFurnished)
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      selectedIsFurnished ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        selectedIsFurnished ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-900">
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
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-1">
                Description (English) *
              </label>
              <textarea
                rows={3}
                {...register("descriptionEn")}
                placeholder="Provide location landmark, condition, water/electricity details..."
                className={`w-full text-xs p-3 bg-slate-50 border rounded-xl font-medium focus:outline-none ${
                  errors.descriptionEn
                    ? "border-red-400 bg-red-50/30"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
              />
              {errors.descriptionEn && (
                <p className="text-[10px] font-bold text-red-600 mt-1">
                  {String(errors.descriptionEn.message)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-1">
                Description (Amharic) *
              </label>
              <textarea
                rows={3}
                {...register("descriptionAm")}
                placeholder="ስለ ንብረቱ ዝርዝር መረጃ ያስገቡ..."
                className={`w-full text-xs p-3 bg-slate-50 border rounded-xl font-medium focus:outline-none ${
                  errors.descriptionAm
                    ? "border-red-400 bg-red-50/30"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
              />
              {errors.descriptionAm && (
                <p className="text-[10px] font-bold text-red-600 mt-1">
                  {String(errors.descriptionAm.message)}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => handleNextStep(3)}
                className="w-2/3 py-3.5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700"
              >
                <span>Continue to Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Location & Publication Disclosure */}
        {step === 3 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                Region *
              </label>
              <select
                {...register("region")}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                {ETHIOPIAN_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                Sub-city (Addis Ababa)
              </label>
              <select
                {...register("subCity")}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                {ADDIS_ABABA_SUBCITIES.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-1">
                Area Name / Landmark *
              </label>
              <input
                type="text"
                {...register("areaName")}
                placeholder="E.g., Bole Atlas, CMC, Sarbet"
                className={`w-full text-xs p-3 bg-slate-50 border rounded-xl font-medium focus:outline-none ${
                  errors.areaName
                    ? "border-red-400 bg-red-50/30"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
              />
              {errors.areaName && (
                <p className="text-[10px] font-bold text-red-600 mt-1">
                  {String(errors.areaName.message)}
                </p>
              )}
            </div>

            {/* Fee Summary Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-950">
                  Calculated Publication Fee
                </span>
                <span className="text-base font-black text-emerald-600">
                  {calculateFee()} ETB
                </span>
              </div>
              <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
                Submitting this listing creates a draft in your portfolio. You
                can upload photos and complete the {calculateFee()} ETB checkout
                to publish it live to the marketplace.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 py-3.5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? "Creating Draft..."
                    : "Create Draft & Continue"}
                </span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
