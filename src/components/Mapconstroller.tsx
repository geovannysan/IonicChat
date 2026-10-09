"use client";

import { useEffect, useState, useMemo } from "react";
import { RotateCcw, Mountain, MapPin, Navigation2 } from "lucide-react";
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup, useMap, MapRoute } from "./ui/map";
import { Button } from "./ui/Button";

interface LocationDetail {
  id: string;
  name: string;
  lng: number;
  lat: number;
  description?: string;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function MapController() {
  const { map, isLoaded } = useMap();
  const [pitch, setPitch] = useState(0);
  const [bearing, setBearing] = useState(0);

  useEffect(() => {
    if (!map || !isLoaded) return;

    const handleMove = () => {
      setPitch(Math.round(map.getPitch()));
      setBearing(Math.round(map.getBearing()));
    };

    map.on("move", handleMove);
    return () => {
      map.off("move", handleMove);
    };
  }, [map, isLoaded]);

  const handle3DView = () => {
    map?.easeTo({
      pitch: 60,
      bearing: -20,
      duration: 1000,
    });
  };

  const handleReset = () => {
    map?.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 1000,
    });
  };

  if (!isLoaded) return null;

  return (
    <div className="absolute top-8 left-3 z-10 flex flex-col gap-2">
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={handle3DView}>
          <Mountain className="size-4 mr-1.5" />
          3D View
        </Button>
        <Button size="sm" variant="secondary" onClick={handleReset}>
          <RotateCcw className="size-4 mr-1.5" />
          Reset
        </Button>
      </div>
      <div className="rounded-md bg-background/90 backdrop-blur px-3 py-2 text-xs font-mono border">
        <div>Pitch: {pitch}°</div>
        <div>Bearing: {bearing}°</div>
      </div>
    </div>
  );
}

function MapContent({
  userLocation,
  locations,
  showRoutes,
  onLocate
}: {
  userLocation: { lng: number; lat: number };
  locations: LocationDetail[];
  showRoutes: boolean;
  onLocate: (coords: { longitude: number; latitude: number }) => void;
}) {
  const { map, isLoaded } = useMap();

  const sortedLocations = useMemo(() => {
    return [...locations]
      .map(loc => ({
        ...loc,
        distance: calculateDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng)
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [locations, userLocation]);

  const routeCoordinates = useMemo(() => {
    if (!showRoutes || sortedLocations.length === 0) return [];
    return [
      [userLocation.lng, userLocation.lat] as [number, number],
      ...sortedLocations.map(loc => [loc.lng, loc.lat] as [number, number])
    ];
  }, [showRoutes, sortedLocations, userLocation]);

  const handleStartRoute = async (index: number) => {
    const location = sortedLocations[index];
    
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${location.lng},${location.lat}?overview=full&geometries=geojson&alternatives=true`
      );
      // no-fetch-response-used-without-status-check: fetch no rechaza en 4xx/5xx,
      // por lo que es necesario verificar response.ok antes de procesar el cuerpo.
      if (!response.ok) {
        throw new Error(`Error al obtener la ruta: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes?.[0]) {
        const coordinates = data.routes[0].geometry.coordinates;
        
        if (map) {
          if (map.getSource('active-route')) {
            map.removeLayer('active-route');
            map.removeSource('active-route');
          }
          
          map.addSource('active-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates
              }
            } as any
          });
          
          map.addLayer({
            id: 'active-route',
            type: 'line',
            source: 'active-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#10b981',
              'line-width': 5,
              'line-opacity': 0.9
            }
          });
          
          const bounds = coordinates.reduce((bounds: any, coord: any) => {
            return bounds.extend(coord);
          }, new (window as any).maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
          
          map.fitBounds(bounds, { padding: 50 });
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const handleOpenGoogleMaps = (index: number) => {
    const location = sortedLocations[index];
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${location.lat},${location.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <>
      <MapController />
      <MapControls
        position="bottom-right"
        showZoom
        showCompass
        showLocate
        showFullscreen
        onLocate={onLocate}
      />

      {isLoaded && routeCoordinates.length > 0 && showRoutes && (
        <MapRoute
          coordinates={routeCoordinates}
          color="#3b82f6"
          width={3}
          opacity={0.5}
        />
      )}

      <MapMarker
        longitude={userLocation.lng}
        latitude={userLocation.lat}
      >
        <MarkerContent>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" style={{ width: '40px', height: '40px', marginLeft: '-12px', marginTop: '-12px' }} />
            <div className="relative rounded-full bg-blue-500 border-2 border-white shadow-lg" style={{ width: '16px', height: '16px' }} />
          </div>
        </MarkerContent>
        <MarkerPopup>
          <div className="space-y-1">
            <p className="font-medium text-foreground">Tu ubicación</p>
            <p className="text-xs text-muted-foreground">
              {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </p>
          </div>
        </MarkerPopup>
      </MapMarker>

      {sortedLocations.map((location, index) => (
        <MapMarker
          key={location.id}
          longitude={location.lng}
          latitude={location.lat}
        >
          <MarkerContent>
            <div className="relative">
              <MapPin className="fill-red-500 stroke-white" size={28} />
              <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xs font-bold text-white">
                {index + 1}
              </span>
            </div>
          </MarkerContent>
          <MarkerPopup closeButton>
            <div className="space-y-2">
              <p className="font-medium text-foreground">{location.name}</p>
              {location.description && (
                <p className="text-xs text-muted-foreground">{location.description}</p>
              )}
              <p className="text-xs font-semibold text-blue-600">
                 {location.distance.toFixed(2)} km
              </p>
              <p className="text-xs text-muted-foreground">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleStartRoute(index)}
                >
                  <Navigation2 className="size-4 mr-1.5" />
                  Iniciar ruta
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleOpenGoogleMaps(index)}
                >
                  Google Maps
                </Button>
              </div>
            </div>
          </MarkerPopup>
        </MapMarker>
      ))}
    </>
  );
}

export function DraggableMarkerExample({
  lng,
  lat,
  locations = []
}: Readonly<{
  lng: number;
  lat: number;
  locations?: LocationDetail[];
}>) {
  const [userLocation, setUserLocation] = useState({ lng, lat });
  const [showRoutes, setShowRoutes] = useState(false);

  useEffect(() => {
    setUserLocation({ lng, lat });
  }, [lng, lat]);

  const handleLocate = (coords: { longitude: number; latitude: number }) => {
    setUserLocation({ lng: coords.longitude, lat: coords.latitude });
  };

  return (
    <div className="h-full w-full">
      <Map center={[userLocation.lng, userLocation.lat]} zoom={12}>
        <MapContent
          userLocation={userLocation}
          locations={locations}
          showRoutes={showRoutes}
          onLocate={handleLocate}
        />
      </Map>
    </div>
  );
}
