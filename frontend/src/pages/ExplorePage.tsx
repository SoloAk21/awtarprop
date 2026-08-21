import React, { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation.js";
import { fetchProperties } from "../api/properties.js";
import { PropertyCard } from "../components/PropertyCard.js";
import { PropertyDetailModal } from "../components/PropertyDetailModal.js";
import { PropertyMap } from "../components/PropertyMap.js";
import { ETHIOPIAN_REGIONS, ADDIS_ABABA_SUBCITIES } from "@awtarprop/shared";
import {
  Search,
  SlidersHorizontal,
  Loader2,
  Map,
  LayoutGrid,
} from "lucide-react";

export function ExplorePage() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Filter States
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [subCity, setSubCity] = useState("");

  const loadProperties = () => {
    setIsLoading(true);
    fetchProperties({
      search: search || undefined,
      purpose: purpose || undefined,
      category: category || undefined,
      region: region || undefined,
      subCity: subCity || undefined,
      limit: 20,
    })
      .then((data) => setProperties(data.properties))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadProperties();
  }, [purpose, category, region, subCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProperties();
  };

  return (
    <div className="space-y-4 pb-20 p-4">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search area, landmark, title..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>

        <button
          type="button"
          onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
          className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-semibold flex items-center gap-1 text-xs hover:bg-emerald-100 transition-colors"
        >
          {viewMode === "list" ? (
            <Map className="w-4 h-4" />
          ) : (
            <LayoutGrid className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`p-2.5 border rounded-xl transition-colors ${
            showFilterDrawer
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </form>

      {/* Filter Drawer */}
      {showFilterDrawer && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
            <span>Filter Properties</span>
            <button
              onClick={() => {
                setPurpose("");
                setCategory("");
                setRegion("");
                setSubCity("");
                setSearch("");
              }}
              className="text-[11px] text-emerald-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="">All Purposes</option>
                <option value="FOR_SALE">For Sale</option>
                <option value="FOR_RENT">For Rent</option>
                <option value="LOOKING_TO_BUY">Looking to Buy</option>
                <option value="LOOKING_TO_RENT">Looking to Rent</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="">All Categories</option>
                <option value="APARTMENT">Apartment</option>
                <option value="CONDOMINIUM">Condominium</option>
                <option value="RESIDENTIAL_HOUSE">House / Villa</option>
                <option value="COMMERCIAL_SPACE">Commercial Space</option>
                <option value="RESIDENTIAL_LAND">Residential Land</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="">All Regions</option>
                {ETHIOPIAN_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sub-city
              </label>
              <select
                value={subCity}
                onChange={(e) => setSubCity(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="">All Sub-cities</option>
                {ADDIS_ABABA_SUBCITIES.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area: Map vs List */}
      {isLoading ? (
        <div className="py-12 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      ) : viewMode === "map" ? (
        <PropertyMap
          properties={properties}
          onSelectProperty={(p) => setSelectedProperty(p)}
        />
      ) : properties.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl text-center border border-slate-100 text-slate-500 text-xs">
          No properties match your active search filters.
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProperty(p)}
              className="cursor-pointer"
            >
              <PropertyCard
                id={p.id}
                titleEn={p.titleEn}
                titleAm={p.titleAm}
                category={p.category}
                purpose={p.purpose}
                priceETB={Number(p.priceETB)}
                areaSqMeters={
                  p.areaSqMeters ? Number(p.areaSqMeters) : undefined
                }
                bedrooms={p.bedrooms}
                bathrooms={p.bathrooms}
                region={p.region}
                subCity={p.subCity}
                areaName={p.areaName}
                providerType={p.providerType}
                viewsCount={p.viewsCount}
                createdAt={p.createdAt}
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
