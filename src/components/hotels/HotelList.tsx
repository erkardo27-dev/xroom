"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Hotel, SortOption } from '@/lib/data';
import { hotels as allHotels } from '@/lib/data';
import { HotelCard } from './HotelCard';
import { HotelCardSkeleton } from './HotelCardSkeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Zap, Filter, ArrowUpDown, MapPin, Star, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from '@/components/ui/separator';

const sortOptionsConfig: { value: SortOption; label: string; icon: React.ElementType }[] = [
    { value: 'distance', label: 'Distance', icon: MapPin },
    { value: 'price', label: 'Price', icon: DollarSign },
    { value: 'rating', label: 'Rating', icon: Star },
];

export default function HotelList() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('distance');

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

  const sortedHotels = useMemo(() => {
    const sorted = [...hotels];
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
  }, [hotels, sortOption]);

  const ActiveSortIcon = sortOptionsConfig.find(o => o.value === sortOption)?.icon || ArrowUpDown;

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-bold font-headline tracking-tight">
            Tonight's deals near you
          </h2>
        </div>
        <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                    <Filter className="mr-2" />
                    Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your results.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                 <p className="text-sm text-muted-foreground">Filter options will be added soon.</p>
                </div>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <ActiveSortIcon className="mr-2" />
                        Sort by
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

            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="ghost">
                <MapPin className="mr-2" />
                Map View
            </Button>
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {sortedHotels.map(hotel => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      )}
    </div>
  );
}
