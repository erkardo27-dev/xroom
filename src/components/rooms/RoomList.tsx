"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Room, SortOption } from '@/lib/data';
import { rooms as allRooms } from '@/lib/data';
import { RoomCard } from './RoomCard';
import { RoomCardSkeleton } from './RoomCardSkeleton';
import { RoomMap } from './RoomMap';
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
    { value: 'distance', label: 'Ойрхон нь эхэндээ', icon: MapPin },
    { value: 'price', label: 'Хямд нь эхэндээ', icon: DollarSign },
    { value: 'rating', label: 'Өндөр үнэлгээтэй нь', icon: Star },
];

const MAX_PRICE = 400;

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
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
              setRooms(allRooms);
              setStatus('success');
            },
            (err) => {
              setError(`Таны байршлыг олоход алдаа гарлаа: ${err.message}. Үндсэн үр дүнг харуулж байна.`);
              setRooms(allRooms);
              setStatus('success'); 
            }
          );
        } else {
            setError("Таны хөтөч байршил тодорхойлохыг дэмжихгүй байна. Үндсэн үр дүнг харуулж байна.");
            setRooms(allRooms);
            setStatus('success');
        }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const filteredAndSortedRooms = useMemo(() => {
    const filtered = rooms.filter(room => 
        room.price >= priceRange[0] &&
        room.price <= priceRange[1] &&
        room.distance <= distanceLimit[0] &&
        room.rating >= minRating[0]
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
  }, [rooms, sortOption, priceRange, distanceLimit, minRating]);

  const ActiveSortIcon = sortOptionsConfig.find(o => o.value === sortOption)?.icon || ArrowUpDown;

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-bold font-headline tracking-tight">
            Таны ойролцоох энэ шөнийн хямдрал
          </h2>
        </div>
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="min-w-[200px] justify-start">
                        <ActiveSortIcon className="mr-2" />
                        {sortOptionsConfig.find(o => o.value === sortOption)?.label || 'Эрэмбэлэх'}
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

            <Button variant="outline" onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}>
                {viewMode === 'list' ? (
                    <>
                        <MapPin className="mr-2" />
                        Газрын зураг
                    </>
                ) : (
                    <>
                        <List className="mr-2" />
                        Жагсаалт
                    </>
                )}
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 border rounded-xl bg-card/50 shadow-sm">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label htmlFor="price-range" className="font-semibold text-card-foreground/80">Үнийн хязгаар</Label>
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
                <Label htmlFor="distance-limit" className="font-semibold text-card-foreground/80">Зай</Label>
                <span className="text-sm font-medium text-primary">{distanceLimit[0]} км хүртэл</span>
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
                <Label htmlFor="min-rating" className="font-semibold text-card-foreground/80">Үнэлгээ</Label>
                <span className="text-sm font-medium text-primary">{minRating[0].toFixed(1)}+ од</span>
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
            <AlertTitle>Байршлын алдаа</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status === 'loading' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {filteredAndSortedRooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
         <RoomMap rooms={filteredAndSortedRooms} />
      )}
    </div>
  );
}
