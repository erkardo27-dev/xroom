"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Room, SortOption } from '@/lib/data';
import { rooms as allRooms } from '@/lib/data';
import { RoomCard } from './RoomCard';
import { RoomCardSkeleton } from './RoomCardSkeleton';
import { RoomMap } from './RoomMap';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Zap, ArrowUpDown, MapPin, Star, DollarSign, List, SlidersHorizontal, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ViewMode = 'list' | 'map';

const sortOptionsConfig: { value: SortOption; label: string; icon: React.ElementType }[] = [
    { value: 'distance', label: 'Ойрхон', icon: MapPin },
    { value: 'price', label: 'Хямд', icon: DollarSign },
    { value: 'rating', label: 'Үнэлгээ', icon: Star },
];

const MAX_PRICE = 400;
const MAX_DISTANCE = 20;

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('distance');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Filter state
  const [priceRange, setPriceRange] = useState<number[]>([0, MAX_PRICE]);
  const [distanceLimit, setDistanceLimit] = useState<number[]>([MAX_DISTANCE]);
  const [minRating, setMinRating] = useState<number[]>([1]);

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
       <div className="text-center mb-8">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            Сүүлчийн минутын хямдрал
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mt-2">Энэ шөнийн онцгой буудлууд</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            {filteredAndSortedRooms.length > 0
              ? `${filteredAndSortedRooms.length} өрөө олдлоо. Та доорх шүүлтүүрүүдийг ашиглан хайлтаа нарийвчлах боломжтой.`
              : "Таны хайлтад тохирох өрөө олдсонгүй. Шүүлтүүрээ өөрчилж дахин оролдоно уу."}
          </p>
       </div>
      
       <div className="sticky top-[65px] z-40 bg-background/90 backdrop-blur-sm rounded-lg border shadow-sm -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 mb-8">
        <div className="max-w-screen-2xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-4 items-center">
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <Label htmlFor="price-range" className="font-semibold">Үнийн хязгаар</Label>
                        <span className="font-medium text-primary">${priceRange[0]} - ${priceRange[1] === MAX_PRICE ? `${MAX_PRICE}+` : `$${priceRange[1]}`}</span>
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
                 <div className="space-y-2">
                     <div className="flex justify-between items-center text-sm">
                        <Label htmlFor="distance-limit" className="font-semibold">Зай</Label>
                        <span className="font-medium text-primary">{distanceLimit[0]} км хүртэл</span>
                    </div>
                    <Slider
                      id="distance-limit"
                      min={1}
                      max={MAX_DISTANCE}
                      step={1}
                      value={distanceLimit}
                      onValueChange={setDistanceLimit}
                    />
                </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <Label htmlFor="min-rating" className="font-semibold">Үнэлгээ</Label>
                        <span className="font-medium text-primary">{minRating[0].toFixed(1)}+ од</span>
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
            <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t">
              <div className='flex items-center gap-2'>
                  <span className="text-sm font-semibold text-muted-foreground mr-2">Эрэмбэлэх:</span>
                  <ToggleGroup
                      type="single"
                      value={sortOption}
                      onValueChange={(value) => {
                          if (value) setSortOption(value as SortOption);
                      }}
                      aria-label="Эрэмбэлэх"
                  >
                      {sortOptionsConfig.map(option => (
                           <ToggleGroupItem key={option.value} value={option.value} aria-label={option.label} className="gap-2">
                              <option.icon className="h-4 w-4" />
                              {option.label}
                          </ToggleGroupItem>
                      ))}
                  </ToggleGroup>
              </div>
              <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                    className="w-40 justify-center"
                  >
                    {viewMode === 'list' ? (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Газрын зураг
                      </>
                    ) : (
                      <>
                        <List className="mr-2 h-4 w-4" />
                        Жагсаалт
                      </>
                    )}
                  </Button>
              </div>
            </div>
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
