import { Map, AdvancedMarker, Pin, MapMouseEvent, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Crosshair, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type MapLocationPickerProps = {
  value?: { lat?: number | null; lng?: number | null };
  onChange: (coords: { lat: number; lng: number }) => void;
  isGettingLocation?: boolean;
  onGetCurrentLocation?: () => void;
};

const ULAANBAATAR_CENTER = { lat: 47.9188, lng: 106.9176 };

export function MapLocationPicker({
  value,
  onChange,
  isGettingLocation,
  onGetCurrentLocation
}: MapLocationPickerProps) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const position = useMemo(() =>
    (value && typeof value.lat === 'number' && typeof value.lng === 'number')
      ? { lat: value.lat, lng: value.lng }
      : null,
    [value]
  );

  // Initialize Autocomplete
  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
    };

    const autocompleteInstance = new placesLib.Autocomplete(inputRef.current, options);
    setAutocomplete(autocompleteInstance);

    return () => {
      if (autocompleteInstance) {
        google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [placesLib]);

  // Handle place selection
  useEffect(() => {
    if (!autocomplete) return;

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onChange({ lat, lng });
        map?.panTo({ lat, lng });
        map?.setZoom(16);
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [autocomplete, onChange, map]);

  const handleMapClick = (event: MapMouseEvent) => {
    if (event.detail.latLng) {
      onChange({ lat: event.detail.latLng.lat, lng: event.detail.latLng.lng });
    }
  };

  const handleMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      onChange({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    }
  };

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border shadow-sm group">
      {/* Search Input Container */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Хаяг, газар хайх..."
            className="pl-10 bg-background/95 backdrop-blur-sm border-primary/20 shadow-lg focus-visible:ring-primary h-11 text-sm rounded-full"
          />
        </div>

        {onGetCurrentLocation && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={onGetCurrentLocation}
            disabled={isGettingLocation}
            className="h-11 w-11 shrink-0 bg-background/95 backdrop-blur-sm border border-primary/20 shadow-lg rounded-full hover:bg-white transition-all active:scale-95"
            title="Миний байршил"
          >
            <Crosshair className={cn("h-5 w-5", isGettingLocation && "animate-spin text-primary")} />
          </Button>
        )}
      </div>

      <Map
        mapId="XROOM_TONIGHT_MAP"
        style={{ width: '100%', height: '100%' }}
        defaultCenter={ULAANBAATAR_CENTER}
        center={position || ULAANBAATAR_CENTER}
        defaultZoom={12}
        gestureHandling={'cooperative'}
        disableDefaultUI={true}
        onClick={handleMapClick}
      >
        {position && (
          <AdvancedMarker
            position={position}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
          >
            <div className="relative flex flex-col items-center">
              <div className="bg-primary text-primary-foreground p-1 px-3 rounded-full text-[10px] font-bold shadow-xl mb-1 whitespace-nowrap animate-in fade-in zoom-in duration-300">
                Танай буудал энд байна
              </div>
              <Pin
                background={'hsl(var(--primary))'}
                borderColor={'white'}
                glyphColor={'white'}
                scale={1.2}
              />
            </div>
          </AdvancedMarker>
        )}
      </Map>

      {/* Guide overlay */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex justify-center">
        <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-2xl animate-in slide-in-from-bottom-2 duration-700">
          <MapPin className="h-3 w-3 text-primary animate-pulse" />
          Зураг дээр дарж эсвэл тэмдэглэгээг чирж байршлаа нарийн зааж болно
        </div>
      </div>
    </div>
  );
}
