"use client";
import { useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "../commonUi/Button";
import { createReactIcon } from "./MapBenchMarker";
import { useMapHook } from "./hooks";
import { PostPopup } from "./PostPopup";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import type { Popup as PopupType } from "leaflet";

type GetAllPostsType = inferRouterOutputs<AppRouter>["post"]["getAllPosts"];

interface InteractiveMapProps {
  mode: "location-picker" | "post-display";
  posts?: GetAllPostsType;
  onLocationSelect?: (lat: number, lng: number, locationName?: string) => void;
  onMapSkinChange?: () => void;
  initialLocation?: { lat: number; lng: number };
  height?: string;
  zoom?: number;
}

function LocationMarker({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={createReactIcon()} />
  );
}

export const InteractiveMap = ({
  mode,
  posts = [],
  onLocationSelect,
  onMapSkinChange,
  initialLocation = { lat: 54.6872, lng: 25.2797 }, // Vilnius
  height = "h-108",
  zoom = 13,
}: InteractiveMapProps) => {
  const [currentMapStyle, setCurrentMapStyle] = useState(0);
  const { mapUrls } = useMapHook();
  const popupRef = useRef<PopupType>(null);

  const handlePopupClose = () => {
    if (popupRef.current) {
      popupRef.current.close();
    }
  };

  const handleMapStyleChange = (newStyleIndex: number) => {
    setCurrentMapStyle(newStyleIndex);
    onMapSkinChange?.();
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    if (mode === "location-picker" && onLocationSelect) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        );
        const data = await response.json();
        const locationName =
          data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        onLocationSelect(lat, lng, locationName);
      } catch (error) {
        console.error("Failed to get location name:", error);
        onLocationSelect(lat, lng);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-white/70">
        Turėk laisvę matyti kokį norį žemėlapį (nes aš galiu taip padaryt):
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {mapUrls.map((mapStyle, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            onClick={() => handleMapStyleChange(index)}
            className={`group relative transform overflow-hidden p-4 font-medium text-white transition-all duration-300 ${
              currentMapStyle === index
                ? "scale-105 shadow-2xl"
                : "hover:shadow-xl"
            }`}
          >
            <div className="relative z-10 flex flex-col items-center space-y-2">
              <div className="text-center text-sm leading-tight">
                {mapStyle.name}
              </div>
            </div>

            {currentMapStyle === index && (
              <div className="absolute top-2 right-2 h-3 w-3 animate-pulse rounded-full bg-green-400" />
            )}
          </Button>
        ))}
      </div>

      <div className={`${height} w-full overflow-hidden rounded-lg`}>
        <MapContainer
          center={[initialLocation.lat, initialLocation.lng]}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution={mapUrls[currentMapStyle]!.attribution}
            url={mapUrls[currentMapStyle]!.url}
          />

          {mode === "location-picker" && (
            <LocationMarker onLocationSelect={handleLocationSelect} />
          )}

          {mode === "post-display" &&
            posts.map((post) => (
              <Marker
                key={post.id}
                position={[post.locationLat, post.locationLng]}
                icon={createReactIcon()}
              >
                <Popup
                  className="airbnb-popup"
                  closeButton={false}
                  ref={popupRef}
                >
                  <PostPopup post={post} onClose={handlePopupClose} />
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
};
