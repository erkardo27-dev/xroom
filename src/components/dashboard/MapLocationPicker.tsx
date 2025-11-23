
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';

type MapLocationPickerProps = {
  value?: { lat?: number | null; lng?: number | null };
  onChange: (coords: { lat: number; lng: number }) => void;
};

export function MapLocationPicker({ value, onChange }: MapLocationPickerProps) {
  const mapImage = useMemo(
    () => PlaceHolderImages.find((img) => img.id === 'ulaanbaatar-map'),
    []
  );

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lat = (y / rect.height) * 100;
    const lng = (x / rect.width) * 100;

    onChange({ lat, lng });
  };

  if (!mapImage) {
    return <div>Газрын зургийн мэдээлэл олдсонгүй.</div>;
  }

  return (
    <div
      className="relative w-full h-64 bg-secondary rounded-lg overflow-hidden border-2 border-dashed cursor-pointer"
      onClick={handleMapClick}
    >
      <Image
        src={mapImage.imageUrl}
        alt={mapImage.description}
        fill
        className="object-cover opacity-30 saturate-50"
        data-ai-hint={mapImage.imageHint}
      />
      {value && value.lat && value.lng && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-full"
          style={{ top: `${value.lat}%`, left: `${value.lng}%` }}
        >
          <MapPin className="w-8 h-8 text-primary drop-shadow-lg" fill="currentColor" />
        </div>
      )}
       <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300">
        <p className="text-white font-semibold bg-black/50 px-4 py-2 rounded-md">
            Байршлаа сонгохын тулд дарна уу
        </p>
      </div>
    </div>
  );
}
