import React, { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation.js';
import { fetchProperties } from '../api/properties.js';
import { PropertyCard } from '../components/PropertyCard.js';
import { ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

export function HomePage() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProperties({ limit: 10 })
      .then((data) => setProperties(data.properties))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-4 pb-20 p-4">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold backdrop-blur-md">
          <Sparkles className="w-3 h-3" />
          <span>Zero Middleman Commission</span>
        </div>

        <h2 className="text-xl font-bold tracking-tight">
          Direct Property & Land Marketplace
        </h2>

        <p className="text-xs text-emerald-100 leading-relaxed">
          Buy, sell, or rent residential properties, commercial spaces, and land across Ethiopia directly.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <ShieldCheck className="text-emerald-500 w-4 h-4" />
          <span>Direct Provider Support</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Supports Property Owners, Brokers, Agents, Agencies, and Developers with verified listing fee publication.
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <h3 className="font-bold text-slate-900 text-sm">Recent Listings</h3>
        <span className="text-xs text-emerald-600 font-semibold">
          {properties.length} Active
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl text-center border border-slate-100 space-y-2">
          <p className="text-xs text-slate-500 font-medium">
            No active property listings yet.
          </p>
          <p className="text-[11px] text-slate-400">
            Be the first to publish a property listing!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              id={p.id}
              titleEn={p.titleEn}
              titleAm={p.titleAm}
              category={p.category}
              purpose={p.purpose}
              priceETB={Number(p.priceETB)}
              areaSqMeters={p.areaSqMeters ? Number(p.areaSqMeters) : undefined}
              bedrooms={p.bedrooms}
              bathrooms={p.bathrooms}
              region={p.region}
              subCity={p.subCity}
              areaName={p.areaName}
              providerType={p.providerType}
              viewsCount={p.viewsCount}
              createdAt={p.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
