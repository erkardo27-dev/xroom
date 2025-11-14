"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Room, SortOption } from '@/lib/data';
import { rooms as allRooms, locations as allLocations } from '@/lib/data';
import { RoomCard } from './RoomCard';
import { RoomCardSkeleton } from './RoomCardSkeleton';
import { RoomMap } from './RoomMap';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Zap, MapPin, Star, DollarSign, List, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Hero from '@/components/layout/Hero';

type ViewMode = 'list' | 'map';

const sortOptionsConfig: { value: SortOption; label: string; icon: React.ElementType }[] = [
    { value: 'distance', label: 'Ойрхон', icon: MapPin },
    { value: 'price', label: 'Хямд', icon: DollarSign },
    { value: 'rating', label: 'Үнэлгээ', icon: Star },
];

const MAX_PRICE = 1000000;
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
  const [location, setLocation] = useState<string>('all');


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
    let activeFilters = 0;
    if (priceRange[0] > 0 || priceRange[1] < MAX_PRICE) activeFilters++;
    if (distanceLimit[0] < MAX_DISTANCE) activeFilters++;
    if (location !== 'all') activeFilters++;

    const filtered = rooms.filter(room => 
        room.price >= priceRange[0] &&
        (priceRange[1] === MAX_PRICE ? true : room.price <= priceRange[1]) &&
        room.distance <= distanceLimit[0] &&
        (location === 'all' || room.location === location)
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
  }, [rooms, sortOption, priceRange, distanceLimit, location]);
  
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (priceRange[0] > 0 || priceRange[1] < MAX_PRICE) count++;
    if (distanceLimit[0] < MAX_DISTANCE) count++;
    if (location !== 'all') count++;
    return count;
  }, [priceRange, distanceLimit, location]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <Hero 
          status={status}
          filteredCount={filteredAndSortedRooms.length}
      />
      
       <div className="sticky top-[65px] z-40 bg-background/95 backdrop-blur-sm rounded-xl border shadow-sm mb-8 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 items-center gap-x-8 gap-y-4">
              {/* Filters */}
              <div className="lg:col-span-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="location-filter" className="font-semibold text-sm">Байршил</Label>
                        <Select value={location} onValueChange={setLocation}>
                          <SelectTrigger id="location-filter" className="w-full">
                            <SelectValue placeholder="Байршил сонгох" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Бүгд</SelectItem>
                            {allLocations.map((loc) => (
                              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                              <Label htmlFor="price-range" className="font-semibold">Үнийн хязгаар</Label>
                              <span className="font-medium text-primary">{priceRange[0].toLocaleString()}₮ - {priceRange[1] === MAX_PRICE ? `${(MAX_PRICE / 1000)}k+₮` : `${priceRange[1].toLocaleString()}₮`}</span>
                          </div>
                          <Slider
                            id="price-range"
                            min={0}
                            max={MAX_PRICE}
                            step={10000}
                            value={priceRange}
                            onValueChange={setPriceRange}
                          >
                            {priceRange.map((_, i) => (
                              <SliderPrimitive.Thumb key={i} className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
                            ))}
                          </Slider>
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
                  </div>
              </div>

              {/* Sort and View */}
              <div className="flex items-center justify-between lg:justify-end gap-4">
                  <div className='flex items-center gap-2'>
                      <ToggleGroup
                          type="single"
                          value={sortOption}
                          onValueChange={(value) => {
                              if (value) setSortOption(value as SortOption);
                          }}
                          aria-label="Эрэмбэлэх"
                          className="gap-1"
                      >
                          {sortOptionsConfig.map(option => (
                                <ToggleGroupItem key={option.value} value={option.value} aria-label={option.label} className="h-9 w-9 p-0 data-[state=on]:bg-primary/20 data-[state=on]:text-primary" data-state={sortOption === option.value ? 'on' : 'off'}>
                                  <option.icon className="h-4 w-4" />
                              </ToggleGroupItem>
                          ))}
                      </ToggleGroup>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                    className="w-28 justify-center"
                  >
                    {viewMode === 'list' ? (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Зураг
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
