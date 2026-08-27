import React, { useState } from "react";
import { createCheckout, verifyPayment } from "../api/payments.js";
import { useTranslation } from "../hooks/useTranslation.js";
import { type LanguageKey } from "../i18n/translations.js";
import { X, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";

export interface CheckoutModalProps {
  property: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckoutModal({
  property,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const { t, translateProviderType, currentLanguage } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamically show the Amharic or English title based on the user's language setting
  const title =
    currentLanguage === "AM"
      ? property.titleAm || property.titleEn
      : property.titleEn || property.titleAm;

  const handlePublishPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const checkout = await createCheckout(property.id);
      await verifyPayment(checkout.transactionId);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || t("paymentFailed" as LanguageKey),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              {t("checkoutTitle" as LanguageKey)}
            </h3>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 bg-slate-100 text-slate-500 rounded-full disabled:opacity-50 transition-colors hover:bg-slate-200"
            aria-label={t("closeCheckout" as LanguageKey)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs">
            {error}
          </div>
        )}

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            {t("targetListing" as LanguageKey)}
          </span>

          <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
            {title}
          </h4>

          <span className="text-xs text-slate-500 block mt-1">
            {t("providerType" as LanguageKey)}:{" "}
            <strong className="text-slate-800">
              {translateProviderType(property.providerType)}
            </strong>
          </span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between font-bold text-xs text-emerald-900">
            <span>{t("publicationFee" as LanguageKey)}</span>
            <span className="text-base font-extrabold text-emerald-600">
              {property.listingFeeETB} ETB
            </span>
          </div>

          <p className="text-[10px] text-emerald-700 leading-relaxed">
            {t("publicationFeeDesc" as LanguageKey)}
          </p>
        </div>

        <button
          onClick={handlePublishPayment}
          disabled={isProcessing}
          className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t("verifyingPublish" as LanguageKey)}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {t("confirmPublish" as LanguageKey)} ({property.listingFeeETB}{" "}
                ETB)
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
