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

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export interface LocationPickerMapProps {
  initialLat?: number;
  initialLng?: number;
  onSelectLocation: (lat: number, lng: number, detectedSubCity: string) => void;
}

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

  return position ? <Marker position={position} /> : null;
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
      <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-0.5">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Interactive Location Pin</span>
        </span>
        <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          Detected: {detectedSubCity} Sub-city
        </span>
      </div>

      <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200/80 shadow-xs relative z-0">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={position} />
          <LocationMarker
            position={position}
            setPosition={handlePositionChange}
          />
        </MapContainer>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
        <span>
          GPS: {position[0].toFixed(5)}, {position[1].toFixed(5)}
        </span>
        <span className="text-emerald-700 font-bold">
          Sub-city Auto-Detected
        </span>
      </div>
    </div>
  );
}
