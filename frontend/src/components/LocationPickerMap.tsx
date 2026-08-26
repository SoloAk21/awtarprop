import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin, Search } from "lucide-react";

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

export interface LocationPickerMapProps {
  initialLat?: number;
  initialLng?: number;
  onSelectLocation: (lat: number, lng: number) => void;
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

  const handlePositionChange = (newPos: [number, number]) => {
    setPosition(newPos);
    onSelectLocation(newPos[0], newPos[1]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pick Exact Location on Map</span>
        </span>
        <span className="text-[10px] text-slate-400 font-medium">
          Tap map to set pin
        </span>
      </div>

      <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 shadow-xs relative z-0">
        <MapContainer
          center={[initialLat, initialLng]}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={handlePositionChange}
          />
        </MapContainer>
      </div>

      <p className="text-[10px] text-slate-400 font-medium text-center">
        GPS Coordinates: {position[0].toFixed(5)}, {position[1].toFixed(5)}
      </p>
    </div>
  );
}
