import React, { useEffect, useState } from 'react';
import { fetchMyListings } from '../api/properties.js';
import { CheckoutModal } from './CheckoutModal.js';
import { Building2, Eye, Tag, ArrowRight } from 'lucide-react';

export function MyListingsSection() {
  const [myListings, setMyListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutProperty, setCheckoutProperty] = useState<any | null>(null);

  const loadListings = () => {
    setIsLoading(true);

    fetchMyListings()
      .then((data) => setMyListings(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadListings();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-4 text-xs text-slate-400">
        Loading your listings...
      </div>
    );
  }

  if (myListings.length === 0) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-100 text-center space-y-1">
        <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-xs font-bold text-slate-700">
          No Listings Submitted Yet
        </p>
        <p className="text-[11px] text-slate-400">
          Post your first property to manage it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-slate-900 px-1">
        My Property Portfolio ({myListings.length})
      </h4>

      {myListings.map((item) => (
        <div
          key={item.id}
          className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-2.5"
        >
          <div className="flex items-start justify-between gap-2">
            <h5 className="font-bold text-xs text-slate-900 line-clamp-1">
              {item.titleEn}
            </h5>

            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                item.publicationStatus === 'PUBLISHED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {item.publicationStatus}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3 text-emerald-600" />
              <span>
                Listing Fee: {item.listingFeeETB} ETB
              </span>
            </div>

            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <Eye className="w-3 h-3 text-slate-400" />
              <span>{item.viewsCount} views</span>
            </div>
          </div>

          {item.publicationStatus !== 'PUBLISHED' && (
            <button
              onClick={() => setCheckoutProperty(item)}
              className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors"
            >
              <span>
                Pay & Publish ({item.listingFeeETB} ETB)
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}

      {checkoutProperty && (
        <CheckoutModal
          property={checkoutProperty}
          onClose={() => setCheckoutProperty(null)}
          onSuccess={loadListings}
        />
      )}
    </div>
  );
}
