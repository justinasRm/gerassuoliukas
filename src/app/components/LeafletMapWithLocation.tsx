import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "./ui/Button";

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, locationName?: string) => void;
  initialLocation?: { lat: number; lng: number };
}

export function LocationMarker({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<LatLng | null>(null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  // Get user's current location on component mount
  useState(() => {
    map.locate({ setView: true, maxZoom: 16 });
  });

  const mapEvents = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function LocationPicker({
  onLocationSelect,
  initialLocation = { lat: 54.6872, lng: 25.2797 }, // Vilnius
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [currentMapStyle, setCurrentMapStyle] = useState(0);

  const handleLocationSelect = useCallback(
    async (lat: number, lng: number) => {
      setSelectedLocation({ lat, lng });

      // Optional: Get human-readable location name using reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        );
        const data = await response.json();
        const locationName =
          data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        console.log("geo data", data);
        onLocationSelect(lat, lng, locationName);
      } catch (error) {
        console.error("Failed to get location name:", error);
        onLocationSelect(lat, lng);
      }
    },
    [onLocationSelect],
  );

  const mapUrls = [
    {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      name: "Kažkoks keistas",
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    },
    {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      name: "Tamsutis",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
    {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      name: "Vanilinis",
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    },
    {
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      name: "Popierius",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
    {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      name: "Spalvotas popierius",
      attribution:
        "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm text-white">
        Spustelėk žemėlapyje, kad pasirinktum vietą:
      </div>

      <div className="text-xs text-white/70">
        Imk laisvę matyti kokį norį žemėlapį (nes aš galiu taip padaryt):
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {mapUrls.map((mapStyle, index) => (
          <Button
            key={index}
            variant="ghost"
            onClick={() => setCurrentMapStyle(index)}
            className={`group relative transform overflow-hidden p-4 font-medium text-white transition-all duration-300 ${currentMapStyle === index ? "scale-105 shadow-2xl" : "hover:shadow-xl"}`}
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

      <div className="h-108 w-full overflow-hidden rounded-lg">
        <MapContainer
          center={[initialLocation.lat, initialLocation.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          key={currentMapStyle}
        >
          <TileLayer
            attribution={mapUrls[currentMapStyle]!.attribution}
            url={mapUrls[currentMapStyle]!.url}
          />
          <LocationMarker onLocationSelect={handleLocationSelect} />
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
          )}
        </MapContainer>
      </div>
      {selectedLocation && (
        <div className="text-sm text-green-400">
          Pasirinkta vieta: {selectedLocation.lat.toFixed(4)},{" "}
          {selectedLocation.lng.toFixed(4)}
        </div>
      )}
    </div>
  );
}
