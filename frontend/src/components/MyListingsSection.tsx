import React, { useEffect, useState } from "react";
import { fetchMyListings } from "../api/properties.js";
import { CheckoutModal } from "./CheckoutModal.js";
import { EditPropertyModal } from "./EditPropertyModal.js";
import {
  Building2,
  Eye,
  Tag,
  ArrowRight,
  Image as ImageIcon,
  Pencil,
  History,
} from "lucide-react";

export function MyListingsSection() {
  const [myListings, setMyListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  const [checkoutProperty, setCheckoutProperty] = useState<any | null>(null);
  const [editingProperty, setEditingProperty] = useState<any | null>(null);

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
      <div className="py-6 text-center space-y-2">
        <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-medium">
          Loading portfolio...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Header & Filter Pills */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Property Portfolio ({myListings.length})
        </span>

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
          <Building2 className="w-7 h-7 text-slate-300 mx-auto stroke-[1.5]" />
          <p className="text-xs font-semibold text-slate-700">
            No Listings in This Filter
          </p>
          <p className="text-[11px] text-slate-400">
            Post a property to manage your listings here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
          {filteredListings.map((item) => {
            const coverUrl =
              item.images && item.images.length > 0 ? item.images[0].url : null;
            const isPublished = item.publicationStatus === "PUBLISHED";

            // Check if listing has been updated after creation (> 60s difference)
            const isEdited =
              new Date(item.updatedAt).getTime() -
                new Date(item.createdAt).getTime() >
              60000;

            return (
              <div
                key={item.id}
                className="p-3.5 space-y-2 hover:bg-slate-50/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={item.titleEn}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h5 className="font-semibold text-xs text-slate-900 truncate">
                          {item.titleEn}
                        </h5>
                        {isEdited && (
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.25 rounded border border-slate-200/60 flex items-center gap-0.5 shrink-0">
                            <History className="w-2.5 h-2.5 text-slate-500" />
                            <span>Edited</span>
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isPublished
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {item.publicationStatus}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {item.category?.replace(/_/g, " ")} · {item.areaName},{" "}
                      {item.region}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100 font-medium">
                  <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Tag className="w-3 h-3 text-emerald-600 stroke-[2]" />
                    <span>Listing Fee: {item.listingFeeETB} ETB</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Eye className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
                      <span>{item.viewsCount || 0} views</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProperty(item);
                      }}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Pencil className="w-3 h-3 text-slate-600" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                {!isPublished && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCheckoutProperty(item);
                    }}
                    className="w-full py-2 bg-emerald-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <span>Pay & Publish ({item.listingFeeETB} ETB)</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onSuccess={() => loadListings()}
        />
      )}

      {/* Checkout Modal */}
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
