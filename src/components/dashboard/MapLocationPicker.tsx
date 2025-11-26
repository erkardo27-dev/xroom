
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

type MapLocationPickerProps = {
  value?: { lat?: number | null; lng?: number | null };
  onChange: (coords: { lat: number; lng: number }) => void;
};

const ULAANBAATAR_CENTER = { lat: 47.9188, lng: 106.9176 };

export function MapLocationPicker({ value, onChange }: MapLocationPickerProps) {
  const position = useMemo(() => {
    if (value && value.lat && value.lng) {
      return { lat: value.lat, lng: value.lng };
    }
    return null;
  }, [value]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      onChange({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    }
  }, [onChange]);
  
  const handleMarkerDragEnd = useCallback((event: google.maps.MapMouseEvent) => {
     if (event.latLng) {
      onChange({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    }
  }, [onChange]);

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
       {!position && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                <p className="text-white font-semibold bg-black/50 px-4 py-2 rounded-md">
                    Байршлаа сонгохын тулд зураг дээр дарна уу
                </p>
            </div>
       )}
    </div>
  );
}
