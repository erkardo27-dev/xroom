"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Hotel, SortOption } from '@/lib/data';
import { hotels as allHotels } from '@/lib/data';
import { HotelCard } from './HotelCard';
import { HotelCardSkeleton } from './HotelCardSkeleton';
import { HotelMap } from './HotelMap';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Zap, ArrowUpDown, MapPin, Star, DollarSign, List } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

type ViewMode = 'list' | 'map';

const sortOptionsConfig: { value: SortOption; label: string; icon: React.ElementType }[] = [
    { value: 'distance', label: 'Ойрхон нь дээрээ', icon: MapPin },
    { value: 'price', label: 'Хямд нь дээрээ', icon: DollarSign },
    { value: 'rating', label: 'Эрэлттэй нь дээрээ', icon: Star },
];

const MAX_PRICE = 400;

export default function HotelList() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('distance');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const [priceRange, setPriceRange] = useState<number[]>([0, MAX_PRICE]);
  const [distanceLimit, setDistanceLimit] = useState<number[]>([15]);
  const [minRating, setMinRating] = useState<number[]>([3]);


  useEffect(() => {
    const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setHotels(allHotels);
              setStatus('success');
            },
            (err) => {
              setError(`Error getting your location: ${err.message}. Showing default results.`);
              setHotels(allHotels);
              setStatus('success'); 
            }
          );
        } else {
            setError("Geolocation is not supported by your browser. Showing default results.");
            setHotels(allHotels);
            setStatus('success');
        }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const filteredAndSortedHotels = useMemo(() => {
    const filtered = hotels.filter(hotel => 
        hotel.price >= priceRange[0] &&
        hotel.price <= priceRange[1] &&
        hotel.distance <= distanceLimit[0] &&
        hotel.rating >= minRating[0]
    );

    const sorted = [...filtered];
    switch (sortOption) {
      case 'distance':
        sorted.sort((a, b) => a.distance - b.distance);
        break;
      case 'price':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
    }
    return sorted;
  }, [hotels, sortOption, priceRange, distanceLimit, minRating]);

  const ActiveSortIcon = sortOptionsConfig.find(o => o.value === sortOption)?.icon || ArrowUpDown;

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-bold font-headline tracking-tight">
            Tonight's deals near you
          </h2>
        </div>
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="min-w-[200px] justify-start">
                        <ActiveSortIcon className="mr-2" />
                        {sortOptionsConfig.find(o => o.value === sortOption)?.label || 'Sort by'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                        {sortOptionsConfig.map(option => (
                             <DropdownMenuRadioItem key={option.value} value={option.value} className="gap-2">
                                <option.icon className="text-muted-foreground" />
                                {option.label}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}>
                {viewMode === 'list' ? (
                    <>
                        <MapPin className="mr-2" />
                        Map View
                    </>
                ) : (
                    <>
                        <List className="mr-2" />
                        List View
                    </>
                )}
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 border rounded-lg bg-card">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label htmlFor="price-range" className="font-semibold">Price Range</Label>
                <span className="text-sm font-medium text-primary">${priceRange[0]} - ${priceRange[1] === MAX_PRICE ? `${MAX_PRICE}+` : priceRange[1]}</span>
            </div>
            <Slider
              id="price-range"
              min={0}
              max={MAX_PRICE}
              step={10}
              value={priceRange}
              onValueChange={setPriceRange}
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label htmlFor="distance-limit" className="font-semibold">Distance</Label>
                <span className="text-sm font-medium text-primary">up to {distanceLimit[0]} km</span>
            </div>
            <Slider
              id="distance-limit"
              min={1}
              max={20}
              step={1}
              value={distanceLimit}
              onValueChange={setDistanceLimit}
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label htmlFor="min-rating" className="font-semibold">Rating</Label>
                <span className="text-sm font-medium text-primary">{minRating[0].toFixed(1)}+ stars</span>
            </div>
             <Slider
              id="min-rating"
              min={1}
              max={5}
              step={0.1}
              value={minRating}
              onValueChange={setMinRating}
            />
          </div>
      </div>


      {status === 'error' && error && (
         <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Location Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status === 'loading' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <HotelCardSkeleton key={i} />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {filteredAndSortedHotels.map(hotel => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      ) : (
         <HotelMap hotels={filteredAndSortedHotels} />
      )}
    </div>
  );
}
