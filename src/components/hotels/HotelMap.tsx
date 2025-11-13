"use client";

import { useState } from 'react';
import type { Hotel } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';

// Mock coordinates for demonstration purposes
const hotelsWithCoords = (hotels: Hotel[]) =>
  hotels.map((hotel, index) => ({
    ...hotel,
    coords: {
      x: Math.random() * 85 + 5, // % position for x
      y: Math.random() * 80 + 10, // % position for y
    },
  }));

export function HotelMap({ hotels }: { hotels: Hotel[] }) {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const mappedHotels = hotelsWithCoords(hotels);

  const handleMarkerClick = (hotel: Hotel) => {
    setSelectedHotel(hotel);
  };

  const closePopup = () => {
    setSelectedHotel(null);
  };
  
  const image = selectedHotel ? PlaceHolderImages.find(img => img.id === selectedHotel.imageId) : null;

  return (
    <div className="relative w-full h-[600px] bg-muted rounded-lg overflow-hidden border">
      <Image
        src="https://images.unsplash.com/photo-1599567437813-75b2713636e2?q=80&w=2070&auto=format&fit=crop"
        alt="City Map"
        fill
        className="object-cover opacity-30"
      />
      {mappedHotels.map(hotel => (
        <button
          key={hotel.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-primary text-primary-foreground rounded-full w-8 h-8 font-bold text-sm shadow-lg hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          style={{ left: `${hotel.coords.x}%`, top: `${hotel.coords.y}%` }}
          onClick={() => handleMarkerClick(hotel)}
          aria-label={`View ${hotel.name}`}
        >
         ${hotel.price}
        </button>
      ))}

      {selectedHotel && image && (
        <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm shadow-2xl z-20 animate-in slide-in-from-bottom-10">
            <CardContent className="p-0">
                <div className="flex">
                    <Image 
                        src={image.imageUrl}
                        alt={selectedHotel.name}
                        width={120}
                        height={120}
                        className="object-cover w-24 h-auto"
                    />
                    <div className="p-3 flex flex-col">
                        <h4 className="font-bold leading-tight">{selectedHotel.name}</h4>
                        <div className="flex items-center text-sm text-muted-foreground mt-1 gap-2">
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold">{selectedHotel.rating.toFixed(1)}</span>
                            </div>
                            <span>{selectedHotel.distance}km away</span>
                        </div>
                        <div className="flex-grow"/>
                        <div className="flex items-end gap-4 mt-2">
                             <p className="text-xl font-bold text-foreground">${selectedHotel.price}</p>
                             <Button size="sm" className="bg-primary hover:bg-primary/90">Book</Button>
                        </div>
                    </div>
                </div>
            </CardContent>
             <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 z-30 bg-background/50" onClick={closePopup}>
                <X className="w-4 h-4" />
                <span className="sr-only">Close</span>
            </Button>
        </Card>
      )}
    </div>
  );
}
