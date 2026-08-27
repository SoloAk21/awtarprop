import React, { useState } from "react";
import {
  initializeChapaCheckout,
  verifyChapaPayment,
} from "../api/payments.js";
import { toast } from "../store/useToastStore.js";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  CreditCard,
  ExternalLink,
  Smartphone,
  Building,
  RotateCcw,
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
  const [activeTxRef, setActiveTxRef] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChapaPay = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      // 1. Initialize Chapa Checkout Transaction
      const checkout = await initializeChapaCheckout(property.id);
      setActiveTxRef(checkout.txRef);

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

      // 3. Trigger initial verification
      await handleVerifyPayment(checkout.txRef);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Chapa payment processing failed",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPayment = async (txRefToVerify?: string) => {
    const ref = txRefToVerify || activeTxRef;
    if (!ref) return;

    setIsVerifying(true);
    setError(null);
    try {
      await verifyChapaPayment(ref);
      setPaymentSuccess(true);
      toast.success("Listing Published Successfully!");
      onSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Payment verification pending. If you completed payment, tap Verify Payment again.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Listing Fee Publication Checkout
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {paymentSuccess ? (
          /* SUCCESS RECEIPT STATE */
          <div className="py-4 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-base">
                Payment Verified & Published!
              </h4>
              <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                Your property listing is now live for all buyers and renters on
                the AwtarProp marketplace.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-left text-xs font-semibold space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Ref:</span>
                <span className="font-mono">{activeTxRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="text-emerald-700 font-black">
                  {property.listingFeeETB} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-600 font-extrabold">
                  PUBLISHED & ACTIVE
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 text-white font-extrabold rounded-xl text-xs shadow-xs hover:bg-emerald-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* PAYMENT INITIALIZATION / VERIFICATION STATE */
          <>
            {/* Property Summary */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Target Listing
              </span>
              <h4 className="font-extrabold text-slate-900 text-xs line-clamp-1">
                {property.titleEn}
              </h4>
              <span className="text-xs text-slate-500 font-medium block">
                Provider Type:{" "}
                <strong className="text-slate-800">
                  {property.providerType}
                </strong>
              </span>
            </div>

            {/* Fee Breakdown & Accepted Methods */}
            <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between font-extrabold text-xs text-emerald-950">
                <span>Chapa Listing Publication Fee</span>
                <span className="text-base font-black text-emerald-600">
                  {property.listingFeeETB} ETB
                </span>
              </div>

              {/* Supported Payment Logos / Chips */}
              <div className="pt-2 border-t border-emerald-200/60 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Supported Payment Methods
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span className="px-2 py-0.5 bg-white text-emerald-900 rounded-md border border-emerald-200 shadow-2xs flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-emerald-600" /> Telebirr
                  </span>
                  <span className="px-2 py-0.5 bg-white text-emerald-900 rounded-md border border-emerald-200 shadow-2xs flex items-center gap-1">
                    <Building className="w-3 h-3 text-emerald-600" /> CBE Birr
                  </span>
                  <span className="px-2 py-0.5 bg-white text-emerald-900 rounded-md border border-emerald-200 shadow-2xs flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-emerald-600" /> Awash /
                    Cards
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {activeTxRef ? (
              /* Polling / Manual Verification State */
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleVerifyPayment()}
                  disabled={isVerifying}
                  className="w-full py-3.5 bg-emerald-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Payment ({property.listingFeeETB} ETB)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleChapaPay}
                  disabled={isProcessing}
                  className="w-full py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-open Chapa Payment Page</span>
                </button>
              </div>
            ) : (
              /* Primary Payment Button */
              <button
                type="button"
                onClick={handleChapaPay}
                disabled={isProcessing}
                className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
