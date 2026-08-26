import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  X,
  Check,
  RotateCcw,
} from "lucide-react";

const PURPOSE_TABS = [
  { value: "", label: "All Purposes" },
  { value: "FOR_SALE", label: "For Sale" },
  { value: "FOR_RENT", label: "For Rent" },
  { value: "LOOKING_TO_BUY", label: "Buy Requests" },
  { value: "LOOKING_TO_RENT", label: "Rent Requests" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "CONDOMINIUM", label: "Condominium" },
  { value: "RESIDENTIAL_HOUSE", label: "House / Villa" },
  { value: "STUDIO", label: "Studio" },
  { value: "COMMERCIAL_SPACE", label: "Commercial Space" },
  { value: "OFFICE", label: "Office" },
  { value: "BUILDING", label: "Full Building" },
  { value: "RESIDENTIAL_LAND", label: "Residential Land" },
  { value: "COMMERCIAL_LAND", label: "Commercial Land" },
  { value: "AGRICULTURAL_LAND", label: "Agricultural Land" },
];

interface FilterSelectProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function FilterSearchSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative space-y-1 w-full" ref={containerRef}>
      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-9 px-3 bg-slate-50 border text-xs font-bold text-slate-800 rounded-xl flex items-center justify-between transition-all ${
          isOpen
            ? "border-emerald-500 ring-1 ring-emerald-500 bg-white"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
            isOpen ? "rotate-180 text-emerald-600" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden text-xs animate-in fade-in duration-100">
          <div className="p-1.5 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              autoFocus
              className="w-full bg-transparent text-xs font-normal text-slate-800 outline-none placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-0.5 hover:bg-slate-200 rounded text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="max-h-36 overflow-y-auto py-1 divide-y divide-slate-50 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200">
            {filtered.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ExplorePage() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [subCity, setSubCity] = useState("");

  const regionOptions = [
    { value: "", label: "All Regions" },
    ...ETHIOPIAN_REGIONS.map((r) => ({ value: r, label: r })),
  ];

  const subCityOptions = [
    { value: "", label: "All Sub-cities" },
    ...ADDIS_ABABA_SUBCITIES.map((sc) => ({ value: sc, label: sc })),
  ];

  const activeFilterCount = [purpose, category, region, subCity].filter(
    Boolean,
  ).length;

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
      .then((data) => {
        if (data?.properties) {
          setProperties([...data.properties]);
        }
      })
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

  const handleResetFilters = () => {
    setSearch("");
    setPurpose("");
    setCategory("");
    setRegion("");
    setSubCity("");
  };

  return (
    <div className="w-full max-w-md mx-auto p-3.5 pb-24 space-y-3.5 text-slate-800">
      {/* Search Bar & View Mode Controls */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search area, landmark, title..."
            className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50/80 border border-slate-200 rounded-xl font-medium focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                loadProperties();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
          className="w-9 h-9 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center justify-center shrink-0 hover:bg-emerald-100 transition-colors"
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
          className={`w-9 h-9 border rounded-xl flex items-center justify-center shrink-0 relative transition-colors ${
            showFilterDrawer || activeFilterCount > 0
              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 && !showFilterDrawer && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-700 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center border-2 border-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      {/* Purpose Quick Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {PURPOSE_TABS.map((tab) => {
          const isSelected = purpose === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setPurpose(tab.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                  : "border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Drawer */}
      {showFilterDrawer && (
        <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-xs font-extrabold text-slate-900">
              Filter Properties
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>

          <div className="space-y-2.5">
            <FilterSearchSelect
              label="Property Category"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(val) => setCategory(val)}
              placeholder="All Categories"
            />

            <div className="grid grid-cols-2 gap-2">
              <FilterSearchSelect
                label="Region"
                options={regionOptions}
                value={region}
                onChange={(val) => setRegion(val)}
                placeholder="All Regions"
              />

              <FilterSearchSelect
                label="Sub-city"
                options={subCityOptions}
                value={subCity}
                onChange={(val) => setSubCity(val)}
                placeholder="All Sub-cities"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area: Map vs List */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-xs font-medium">Searching properties...</span>
        </div>
      ) : properties.length === 0 ? (
        <div className="p-8 bg-slate-50/50 rounded-2xl text-center border border-slate-100 space-y-1">
          <p className="text-xs font-bold text-slate-700">
            No Matching Properties Found
          </p>
          <p className="text-[11px] text-slate-400">
            Try broadening your search or resetting active filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((p: any) => (
            <div
              key={p.id}
              onClick={() => setSelectedProperty(p)}
              className="cursor-pointer"
            >
              <PropertyCard property={p} from="ExplorePage" />
            </div>
          ))}
        </div>
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}
