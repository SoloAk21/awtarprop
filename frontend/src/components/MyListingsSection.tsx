import React, { useEffect, useState } from "react";
import { fetchMyListings } from "../api/properties.js";
import { CheckoutModal } from "./CheckoutModal.js";
import {
  Building2,
  Eye,
  Tag,
  ArrowRight,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export function MyListingsSection() {
  const [myListings, setMyListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [checkoutProperty, setCheckoutProperty] = useState<any | null>(null);

  const loadListings = () => {
    setIsLoading(true);
    fetchMyListings()
      .then((data) => setMyListings(data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = myListings.filter((item) => {
    if (filter === "PUBLISHED") return item.publicationStatus === "PUBLISHED";
    if (filter === "DRAFT") return item.publicationStatus !== "PUBLISHED";
    return true;
  });

  if (isLoading) {
    return (
      <div className="py-8 text-center space-y-2">
        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-medium">
          Loading portfolio...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Portfolio Header & Filter Pills */}
      <div className="flex items-center justify-between px-0.5">
        <h4 className="text-xs font-extrabold text-slate-900">
          Property Portfolio ({myListings.length})
        </h4>

        <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
          {(["ALL", "PUBLISHED", "DRAFT"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                filter === tab
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-center space-y-1">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto stroke-[1.5]" />
          <p className="text-xs font-bold text-slate-700">
            No Listings in This Filter
          </p>
          <p className="text-[11px] text-slate-400">
            Post a property to manage your listings here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredListings.map((item) => {
            const coverUrl =
              item.images && item.images.length > 0 ? item.images[0].url : null;
            const isPublished = item.publicationStatus === "PUBLISHED";

            return (
              <div
                key={item.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={item.titleEn}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="font-extrabold text-xs text-slate-900 truncate">
                        {item.titleEn}
                      </h5>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                          isPublished
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.publicationStatus}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {item.category?.replace(/_/g, " ")} · {item.region}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-semibold">
                  <div className="flex items-center gap-1 text-emerald-700 font-extrabold">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    <span>Listing Fee: {item.listingFeeETB} ETB</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <Eye className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{item.viewsCount || 0} views</span>
                  </div>
                </div>

                {!isPublished && (
                  <button
                    type="button"
                    onClick={() => setCheckoutProperty(item)}
                    className="w-full py-2 bg-emerald-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs"
                  >
                    <span>Pay & Publish ({item.listingFeeETB} ETB)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {checkoutProperty && (
        <CheckoutModal
          property={checkoutProperty}
          onClose={() => setCheckoutProperty(null)}
          onSuccess={() => loadListings()}
        />
      )}
    </div>
  );
}
