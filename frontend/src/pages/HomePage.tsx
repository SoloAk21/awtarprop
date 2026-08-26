import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation.js";
import { fetchProperties } from "../api/properties.js";
import { PropertyCard } from "../components/PropertyCard.js";
import { PropertyDetailModal } from "../components/PropertyDetailModal.js";
import { ETHIOPIAN_REGIONS } from "@awtarprop/shared";
import {
  ShieldCheck,
  MapPin,
  Sparkles,
  Loader2,
  ArrowRight,
  PlusCircle,
  Search,
} from "lucide-react";

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

  useEffect(() => {
    fetchProperties({ limit: 10 })
      .then((data) => {
        if (data?.properties) {
          setProperties([...data.properties]);
        }
      })
      .catch((err) => console.error("[HomePage] fetchProperties error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="w-full max-w-md mx-auto p-3.5 pb-24 space-y-4 text-slate-800">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 rounded-2xl shadow-sm space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-medium backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-emerald-200" />
          <span>Zero Middleman Commission</span>
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight leading-snug">
            Direct Property & Land Marketplace
          </h2>
          <p className="text-xs text-emerald-100 font-medium leading-relaxed">
            Buy, sell, or rent residential properties, commercial spaces, and
            land across Ethiopia directly.
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => navigate("/explore")}
            className="flex-1 py-2.5 bg-white text-emerald-900 font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-emerald-50 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-emerald-700" />
            <span>Explore Market</span>
          </button>
          <button
            onClick={() => navigate("/post")}
            className="flex-1 py-2.5 bg-emerald-800/60 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 border border-white/20 hover:bg-emerald-800/80 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-white" />
            <span>Post Listing</span>
          </button>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 bg-slate-50/80 border border-slate-100 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <ShieldCheck className="text-emerald-600 w-4 h-4 shrink-0" />
            <span>Direct Provider</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight font-normal">
            Connect directly with Owners, Brokers, Agents & Developers.
          </p>
        </div>

        <div className="p-3 bg-slate-50/80 border border-slate-100 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <MapPin className="text-emerald-600 w-4 h-4 shrink-0" />
            <span>Ethiopia Nationwide</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight font-normal">
            Listings supported across all {ETHIOPIAN_REGIONS.length} regions.
          </p>
        </div>
      </div>

      {/* Feed Header */}
      <div className="flex items-center justify-between px-0.5 pt-1">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">
            Recent Listings
          </h3>
          <p className="text-[11px] text-slate-400 font-normal">
            Verified direct property publications
          </p>
        </div>
        <button
          onClick={() => navigate("/explore")}
          className="text-xs font-medium text-emerald-700 flex items-center gap-1 hover:underline"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Property Cards */}
      {/* Property Feed Cards */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-xs font-medium">
            Loading recent listings...
          </span>
        </div>
      ) : properties.length === 0 ? (
        <div className="p-8 bg-slate-50/50 rounded-2xl text-center border border-slate-100 space-y-1">
          <p className="text-xs font-semibold text-slate-700">
            No Active Listings Available
          </p>
          <p className="text-[11px] text-slate-400">
            Be the first provider to publish a property listing!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProperty(p)}
              className="cursor-pointer"
            >
              {/* FIX: Explicitly pass the full property and images */}
              <PropertyCard
                property={p}
                images={p.images || []}
                from="HomePage"
              />
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}
