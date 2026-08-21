import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin, ArrowUpRight } from "lucide-react";

// Fix default Leaflet marker icon asset issue in Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export interface PropertyMapProps {
  properties: any[];
  onSelectProperty: (property: any) => void;
}

export function PropertyMap({
  properties,
  onSelectProperty,
}: PropertyMapProps) {
  // Center coordinates: Addis Ababa city center
  const defaultCenter: [number, number] = [9.0192, 38.7525];

  const formatPrice = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ETB`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K ETB`;
    }
    return `${amount} ETB`;
  };

  return (
    <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {properties.map((p) => {
          // Fallback coordinates if custom lat/lng not provided
          const lat = p.latitude || 9.0192 + (Math.random() - 0.5) * 0.08;
          const lng = p.longitude || 38.7525 + (Math.random() - 0.5) * 0.08;

          return (
            <Marker key={p.id} position={[lat, lng]}>
              <Popup className="custom-popup">
                <div className="p-1 space-y-1.5 text-xs max-w-[200px]">
                  <span className="font-bold text-emerald-600 block text-sm">
                    {formatPrice(Number(p.priceETB))}
                  </span>
                  <h4 className="font-bold text-slate-900 line-clamp-1">
                    {p.titleEn}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="line-clamp-1">
                      {p.areaName}, {p.subCity || p.region}
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectProperty(p)}
                    className="w-full mt-1.5 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 hover:bg-emerald-700"
                  >
                    <span>View Details</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
