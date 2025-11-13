"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Hotel, SortOption } from '@/lib/data';
import { hotels as allHotels } from '@/lib/data';
import { HotelCard } from './HotelCard';
import { HotelCardSkeleton } from './HotelCardSkeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Zap } from 'lucide-react';

type HotelListProps = {
  sortOption: SortOption;
}

export default function HotelList({ sortOption }: HotelListProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // For this demo, we'll just use the mock data with random distances.
              // In a real app, you'd fetch based on `position`.
              setHotels(allHotels);
              setStatus('success');
            },
            (err) => {
              setError(`Error getting your location: ${err.message}. Showing default results.`);
              // Fallback to showing all hotels if location is denied
              setHotels(allHotels);
              setStatus('success'); // Show hotels even if location fails
            }
          );
        } else {
            setError("Geolocation is not supported by your browser. Showing default results.");
            // Fallback for non-supporting browsers
            setHotels(allHotels);
            setStatus('success');
        }
    }, 500); // Simulate network latency

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

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="flex items-center gap-3 mb-8">
        <Zap className="w-8 h-8 text-accent" />
        <h2 className="text-3xl font-bold font-headline tracking-tight">
          Tonight's deals near you
        </h2>
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
