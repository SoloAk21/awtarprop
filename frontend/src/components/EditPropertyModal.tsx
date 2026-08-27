import React, { useState } from "react";
import { updatePropertyListing } from "../api/properties.js";
import { X, CheckCircle2, Loader2, Pencil, AlertCircle } from "lucide-react";

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
  const [titleEn, setTitleEn] = useState(property.titleEn || "");
  const [titleAm, setTitleAm] = useState(property.titleAm || "");
  const [priceETB, setPriceETB] = useState(property.priceETB || "");
  const [descriptionEn, setDescriptionEn] = useState(
    property.descriptionEn || "",
  );
  const [descriptionAm, setDescriptionAm] = useState(
    property.descriptionAm || "",
  );
  const [areaName, setAreaName] = useState(property.areaName || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await updatePropertyListing(property.id, {
        titleEn,
        titleAm,
        priceETB: Number(priceETB),
        descriptionEn,
        descriptionAm,
        areaName,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update property listing",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl p-5 space-y-4 overflow-y-auto animate-in slide-in-from-bottom duration-200 text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-slate-900 text-sm">
              Edit Property Listing
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
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Title (English)
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Title (Amharic)
            </label>
            <input
              type="text"
              value={titleAm}
              onChange={(e) => setTitleAm(e.target.value)}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Price (ETB)
            </label>
            <input
              type="number"
              value={priceETB}
              onChange={(e) => setPriceETB(e.target.value)}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-emerald-700 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Area Landmark
            </label>
            <input
              type="text"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Description (English)
            </label>
            <textarea
              rows={2}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal focus:outline-none focus:border-emerald-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Description (Amharic)
            </label>
            <textarea
              rows={2}
              value={descriptionAm}
              onChange={(e) => setDescriptionAm(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal focus:outline-none focus:border-emerald-500 resize-none"
              required
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl text-xs hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
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
