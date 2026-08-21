import React from 'react';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Shield,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.js';

export interface PropertyCardProps {
  id: string;
  titleEn: string;
  titleAm: string;
  category: string;
  purpose: string;
  priceETB: number;
  areaSqMeters?: number;
  bedrooms?: number;
  bathrooms?: number;
  region: string;
  subCity?: string;
  areaName: string;
  providerType: string;
  viewsCount: number;
  images?: any[];
  createdAt: string;
}

export function PropertyCard({
  titleEn,
  titleAm,
  category,
  purpose,
  priceETB,
  areaSqMeters,
  bedrooms,
  bathrooms,
  region,
  subCity,
  areaName,
  providerType,
  viewsCount,
  images = [],
}: PropertyCardProps) {
  const { currentLanguage } = useTranslation();
  const title = currentLanguage === 'AM' ? titleAm : titleEn;

  const mainImage =
    images.length > 0 ? images[0].url : null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(amount);

  const getPurposeBadge = (p: string) => {
    switch (p) {
      case 'FOR_SALE':
        return {
          text: 'For Sale',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'FOR_RENT':
        return {
          text: 'For Rent',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'LOOKING_TO_BUY':
        return {
          text: 'Looking to Buy',
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      default:
        return {
          text: 'Looking to Rent',
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
        };
    }
  };

  const badge = getPurposeBadge(purpose);

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-44 bg-slate-100 relative flex items-center justify-center text-slate-400 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <ImageIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">
              No Image Uploaded
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.bg}`}
          >
            {badge.text}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
          <Eye className="w-3 h-3" />
          <span>{viewsCount}</span>
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
            {title}
          </h3>

          <span className="text-sm font-extrabold text-emerald-600 whitespace-nowrap">
            {formatCurrency(priceETB)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="line-clamp-1">
            {areaName}, {subCity ? `${subCity}, ` : ''}
            {region}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600 pt-1 border-t border-slate-100 font-medium">
          {bedrooms !== undefined && bedrooms !== null && (
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-slate-400" />
              <span>{bedrooms} Beds</span>
            </div>
          )}

          {bathrooms !== undefined && bathrooms !== null && (
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              <span>{bathrooms} Baths</span>
            </div>
          )}

          {areaSqMeters !== undefined && areaSqMeters !== null && (
            <div className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5 text-slate-400" />
              <span>{areaSqMeters} m²</span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1 text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
            <Shield className="w-3 h-3 text-emerald-600" />
            <span>{providerType}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
