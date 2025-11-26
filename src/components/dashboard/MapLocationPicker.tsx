
'use client';

import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

type MapLocationPickerProps = {
  value?: { lat?: number | null; lng?: number | null };
  onChange: (coords: { lat: number; lng: number }) => void;
};

const ULAANBAATAR_CENTER = { lat: 47.9188, lng: 106.9176 };

export function MapLocationPicker({ value, onChange }: MapLocationPickerProps) {
  
  const position = (value && typeof value.lat === 'number' && typeof value.lng === 'number')
    ? { lat: value.lat, lng: value.lng }
    : null;

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
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
        center={position || ULAANBAATAR_CENTER}
        defaultZoom={12}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        onClick={handleMapClick}
      >
        {position && (
          <AdvancedMarker 
            position={position}
          >
            <Pin 
                background={'hsl(var(--primary))'} 
                borderColor={'hsl(var(--primary))'} 
                glyphColor={'hsl(var(--primary-foreground))'}
            />
          </AdvancedMarker>
        )}
      </Map>
       {!position && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
            <p className="text-white font-semibold text-center p-4 bg-black/50 rounded-lg">
                Байршлаа сонгохын тулд<br/>газрын зураг дээр дарна уу
            </p>
        </div>
      )}
    </div>
  );
}
