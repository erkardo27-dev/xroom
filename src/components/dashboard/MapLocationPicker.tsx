
'use client';

import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

type MapLocationPickerProps = {
  value?: { lat?: number | null; lng?: number | null };
  onChange: (coords: { lat: number; lng: number }) => void;
};

const ULAANBAATAR_CENTER = { lat: 47.9188, lng: 106.9176 };

export function MapLocationPicker({ value, onChange }: MapLocationPickerProps) {
  // This was the source of the bug. `useMemo` prevented the position from
  // re-calculating when the parent form state changed via `onChange`.
  // By making it a simple variable, it gets re-evaluated on every render.
  const position = (value && typeof value.lat === 'number' && typeof value.lng === 'number')
    ? { lat: value.lat, lng: value.lng }
    : null;

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      onChange({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    }
  };
  
  const handleMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
     if (event.latLng) {
      onChange({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    }
  };

  return (
    <div className="relative w-full h-80 rounded-lg overflow-hidden border">
      <Map
        mapId="XROOM_TONIGHT_MAP"
        style={{ width: '100%', height: '100%' }}
        defaultCenter={ULAANBAATAR_CENTER}
        defaultZoom={12}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        onClick={handleMapClick}
      >
        {position && (
          <AdvancedMarker 
            position={position}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
          >
            <Pin 
                background={'hsl(var(--primary))'} 
                borderColor={'hsl(var(--primary))'} 
                glyphColor={'hsl(var(--primary-foreground))'}
            />
          </AdvancedMarker>
        )}
      </Map>
    </div>
  );
}
