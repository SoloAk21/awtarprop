import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";
import { findSubCityByCoordinates } from "../utils/addisSubcities.js";

// Custom AwtarProp Emerald Brand Pin Marker
const emeraldPinIcon = L.divIcon({
  className: "custom-emerald-pin",
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
      <div style="width: 32px; height: 32px; background-color: #059669; color: white; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(5,150,105,0.3); border: 2px solid white;">
        <svg style="width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export interface LocationPickerMapProps {
  initialLat?: number;
  initialLng?: number;
  onSelectLocation: (lat: number, lng: number, detectedSubCity: string) => void;
}

// Map Controller Component for smooth flyTo animation
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1.2 });
  }, [center, map]);
  return null;
}

function LocationMarker({
  position,
  setPosition,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} icon={emeraldPinIcon} /> : null;
}

export function LocationPickerMap({
  initialLat = 9.0192,
  initialLng = 38.7525,
  onSelectLocation,
}: LocationPickerMapProps) {
  const [position, setPosition] = useState<[number, number]>([
    initialLat,
    initialLng,
  ]);
  const [detectedSubCity, setDetectedSubCity] = useState<string>("Bole");

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
      const sub = findSubCityByCoordinates(initialLat, initialLng);
      setDetectedSubCity(sub);
    }
  }, [initialLat, initialLng]);

  const handlePositionChange = (newPos: [number, number]) => {
    setPosition(newPos);
    const sub = findSubCityByCoordinates(newPos[0], newPos[1]);
    setDetectedSubCity(sub);
    onSelectLocation(newPos[0], newPos[1], sub);
  };

  return (
    <div className="space-y-1.5">
      {/* Minimal Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-0.5">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />
          <span>Location Pin</span>
        </span>
        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100/80">
          {detectedSubCity} Sub-city
        </span>
      </div>

      {/* Clean Map Container */}
      <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs relative z-0">
        <MapContainer
          center={position}
          zoom={13}
          zoomControl={false} // Hides clunky + / - buttons
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapController center={position} />
          <LocationMarker
            position={position}
            setPosition={handlePositionChange}
          />
        </MapContainer>
      </div>

      {/* Minimal Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
        <span>
          {position[0].toFixed(5)}, {position[1].toFixed(5)}
        </span>
        <span className="text-emerald-700 font-semibold">
          Sub-city Auto-Detected
        </span>
      </div>
    </div>
  );
}
