import { useTranslation } from "../hooks/useTranslation.js";
import { X, MapPin, Shield, Eye, Phone, MessageSquare } from "lucide-react";

export interface PropertyDetailModalProps {
  property: any;
  onClose: () => void;
}

export function PropertyDetailModal({
  property,
  onClose,
}: PropertyDetailModalProps) {
  const { currentLanguage } = useTranslation();

  if (!property) return null;

  const title = currentLanguage === "AM" ? property.titleAm : property.titleEn;
  const description =
    currentLanguage === "AM" ? property.descriptionAm : property.descriptionEn;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(amount);

  const telegramUsername = property.provider?.username;
  const contactPhone = property.provider?.phoneNumber;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto flex flex-col animate-in slide-in-from-bottom duration-200">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
            {property.category?.replace(/_/g, " ")}
          </span>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
            aria-label="Close property details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 flex-1">
          <div>
            <span className="text-xl font-extrabold text-emerald-600">
              {formatCurrency(Number(property.priceETB))}
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-1 leading-snug">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
            <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {property.areaName}
              {property.subCity ? `, ${property.subCity}` : ""}
              {property.region ? `, ${property.region}` : ""}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="block text-[10px] text-slate-400 font-medium">
                Bedrooms
              </span>
              <span className="font-bold text-slate-800">
                {property.bedrooms ?? "-"}
              </span>
            </div>

            <div>
              <span className="block text-[10px] text-slate-400 font-medium">
                Bathrooms
              </span>
              <span className="font-bold text-slate-800">
                {property.bathrooms ?? "-"}
              </span>
            </div>

            <div>
              <span className="block text-[10px] text-slate-400 font-medium">
                Area
              </span>
              <span className="font-bold text-slate-800">
                {property.areaSqMeters ? `${property.areaSqMeters} m²` : "-"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">Description</h4>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
              {description}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />

              <div>
                <span className="font-bold text-slate-800 block">
                  {property.provider?.firstName}{" "}
                  {property.provider?.lastName || ""}
                </span>

                <span className="text-[10px] text-slate-500 font-medium">
                  {property.providerType}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Eye className="w-3.5 h-3.5" />
              <span>{property.viewsCount} views</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex gap-2">
          {telegramUsername ? (
            <a
              href={`https://t.me/${telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Direct Telegram Chat</span>
            </a>
          ) : (
            <div className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs text-center">
              No Telegram Username Provided
            </div>
          )}

          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="p-3 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 transition-colors"
              aria-label="Call provider"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
