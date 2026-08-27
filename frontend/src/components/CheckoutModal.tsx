import React, { useState } from "react";
import {
  initializeChapaCheckout,
  verifyChapaPayment,
} from "../api/payments.js";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  CreditCard,
  ExternalLink,
} from "lucide-react";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChapaPay = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      // 1. Initialize Chapa Checkout Transaction
      const checkout = await initializeChapaCheckout(property.id);

      // 2. Open Chapa Payment Window inside Telegram Mini App container
      if (checkout.checkoutUrl) {
        if (window.Telegram?.WebApp?.openLink) {
          window.Telegram.WebApp.openLink(checkout.checkoutUrl, {
            try_instant_view: false,
          });
        } else {
          window.open(checkout.checkoutUrl, "_blank");
        }
      }

      // 3. Verify Payment Status and Publish
      await verifyChapaPayment(checkout.txRef);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Chapa payment processing failed",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Listing Publication Checkout
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-slate-100 text-slate-500 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {/* Property Summary */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Target Listing
          </span>
          <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
            {property.titleEn}
          </h4>
          <span className="text-xs text-slate-500 block">
            Provider Type:{" "}
            <strong className="text-slate-800">{property.providerType}</strong>
          </span>
        </div>

        {/* Fee Breakdown */}
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between font-bold text-xs text-emerald-900">
            <span>Chapa Listing Publication Fee</span>
            <span className="text-base font-extrabold text-emerald-600">
              {property.listingFeeETB} ETB
            </span>
          </div>
          <p className="text-[10px] text-emerald-700 leading-relaxed font-medium">
            Supports Telebirr, CBE Birr, Awash, Amole & Debit/Credit Cards via
            Chapa payment gateway.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleChapaPay}
          disabled={isProcessing}
          className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting Chapa Gateway...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Pay with Chapa ({property.listingFeeETB} ETB)</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
