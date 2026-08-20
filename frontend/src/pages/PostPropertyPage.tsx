import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { createPropertyListing } from "../api/properties.js";
import { ETHIOPIAN_REGIONS, ADDIS_ABABA_SUBCITIES } from "@awtarprop/shared";
import {
  PlusCircle,
  Info,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
} from "lucide-react";

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
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      purpose: "FOR_SALE",
      category: "APARTMENT",
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
      areaSqMeters: 100,
      providerType: user?.providerType || "OWNER",
    },
  });

  const selectedCategory = watch("category");
  const selectedProviderType = watch("providerType");

  // Estimate publication fee
  const calculateFee = () => {
    let fee = 100;
    if (selectedProviderType === "BROKER" || selectedProviderType === "AGENT")
      fee = 150;
    if (
      selectedProviderType === "AGENCY" ||
      selectedProviderType === "DEVELOPER"
    )
      fee = 300;
    if (selectedCategory?.includes("LAND") || selectedCategory === "BUILDING")
      fee += 100;
    return fee;
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        ...data,
        priceETB: Number(data.priceETB),
        bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
        areaSqMeters: data.areaSqMeters ? Number(data.areaSqMeters) : undefined,
      };

      await createPropertyListing(payload);
      navigate("/");
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message || "Failed to submit property listing",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 p-4">
      {/* Step Indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <PlusCircle className="text-emerald-600 w-5 h-5" />
          <h2 className="text-base font-bold text-slate-900">{t("navPost")}</h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
          Step {step} of 3
        </span>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* STEP 1: Category & Purpose */}
        {step === 1 && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Listing Purpose
              </label>
              <select
                {...register("purpose")}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="FOR_SALE">For Sale</option>
                <option value="FOR_RENT">For Rent</option>
                <option value="LOOKING_TO_BUY">Looking to Buy</option>
                <option value="LOOKING_TO_RENT">Looking to Rent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Property Category
              </label>
              <select
                {...register("category")}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
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

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Provider Type
              </label>
              <select
                {...register("providerType")}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="OWNER">Property Owner</option>
                <option value="BROKER">Broker / Delala</option>
                <option value="AGENT">Real Estate Agent</option>
                <option value="AGENCY">Agency</option>
                <option value="DEVELOPER">Developer</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <span>Next: Details & Price</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Titles, Price & Specs */}
        {step === 2 && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Title (English) *
              </label>
              <input
                type="text"
                {...register("titleEn", { required: true, minLength: 5 })}
                placeholder="E.g., Modern 2 Bedroom Apartment in Bole Atlas"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Title (Amharic) *
              </label>
              <input
                type="text"
                {...register("titleAm", { required: true, minLength: 5 })}
                placeholder="ምሳሌ፦ በቦሌ አትላስ ዘመናዊ የ 2 መኝታ አፓርትመንት"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Price (ETB) *
              </label>
              <input
                type="number"
                {...register("priceETB", { required: true, min: 1 })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  {...register("bedrooms")}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  {...register("bathrooms")}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Area (m²)
                </label>
                <input
                  type="number"
                  {...register("areaSqMeters")}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Description (English) *
              </label>
              <textarea
                rows={3}
                {...register("descriptionEn", {
                  required: true,
                  minLength: 10,
                })}
                placeholder="Provide property details, amenities, condition..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Description (Amharic) *
              </label>
              <textarea
                rows={3}
                {...register("descriptionAm", {
                  required: true,
                  minLength: 10,
                })}
                placeholder="ስለ ንብረቱ ዝርዝር መረጃ ያስገቡ..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <span>Next: Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Location & Fee Preview */}
        {step === 3 && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Region *
              </label>
              <select
                {...register("region", { required: true })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {ETHIOPIAN_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Sub-city (Addis Ababa)
              </label>
              <select
                {...register("subCity")}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {ADDIS_ABABA_SUBCITIES.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Area Name / Landmark *
              </label>
              <input
                type="text"
                {...register("areaName", { required: true, minLength: 2 })}
                placeholder="E.g., Bole Atlas, CMC, Sarbet"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Fee Summary Card */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between font-bold text-xs text-emerald-900">
                <span>Estimated Listing Publication Fee</span>
                <span className="text-sm text-emerald-600">
                  {calculateFee()} ETB
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 leading-relaxed">
                Publishing this listing as {selectedProviderType} requires a
                one-time listing publication fee.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSubmitting ? "Submitting..." : "Create Listing Draft"}
                </span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
