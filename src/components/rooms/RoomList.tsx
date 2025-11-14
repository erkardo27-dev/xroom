

"use client";

import { useState, useMemo } from 'react';
import type { Room, SortOption, RoomInstance } from '@/lib/data';
import { locations as allLocations } from '@/lib/data';
import { RoomCard } from './RoomCard';
import { RoomCardSkeleton } from './RoomCardSkeleton';
import { RoomMap } from './RoomMap';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, List, MapPin, DollarSign, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Hero from '@/components/layout/Hero';
import { useRoom } from '@/context/RoomContext';
import { startOfDay } from 'date-fns';

type ViewMode = 'list' | 'map';

const sortOptionsConfig: { value: SortOption; label: string; icon: React.ElementType }[] = [
    { value: 'distance', label: 'Ойрхон', icon: MapPin },
    { value: 'price', label: 'Хямд', icon: DollarSign },
    { value: 'rating', label: 'Үнэлгээ', icon: Star },
];

const MAX_PRICE = 1000000;
const MAX_DISTANCE = 20;

export default function RoomList() {
  const { rooms, roomInstances, status, error, getRoomStatusForDate } = useRoom();
  const [sortOption, setSortOption] = useState<SortOption>('distance');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Filter state
  const [priceRange, setPriceRange] = useState<number[]>([0, MAX_PRICE]);
  const [distanceLimit, setDistanceLimit] = useState<number[]>([MAX_DISTANCE]);
  const [location, setLocation] = useState<string>('all');
  const [heroSearchTerm, setHeroSearchTerm] = useState<string>("");

  const availableRoomsByType = useMemo(() => {
    const today = startOfDay(new Date());

    const availableInstancesByRoomType = roomInstances.reduce((acc, instance) => {
        const status = getRoomStatusForDate(instance.instanceId, today);
        if (status === 'available') {
            if (!acc[instance.roomTypeId]) {
                acc[instance.roomTypeId] = [];
            }
            acc[instance.roomTypeId].push(instance);
        }
        return acc;
    }, {} as Record<string, RoomInstance[]>);

    return rooms
      .map(roomType => ({
        ...roomType,
        availableInstances: availableInstancesByRoomType[roomType.id] || [],
      }))
      .filter(roomType => roomType.availableInstances.length > 0);

  }, [rooms, roomInstances, getRoomStatusForDate]);


  const filteredAndSortedRooms = useMemo(() => {
    let filtered = availableRoomsByType;

    // Hero search filter
    if (heroSearchTerm) {
        const lowercasedTerm = heroSearchTerm.toLowerCase();
        filtered = filtered.filter(room => 
            room.hotelName.toLowerCase().includes(lowercasedTerm) ||
            room.location.toLowerCase().includes(lowercasedTerm)
        );
    }
      
    // Other filters
    filtered = filtered.filter(room => 
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
  }, [availableRoomsByType, sortOption, priceRange, distanceLimit, location, heroSearchTerm]);
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <Hero 
          status={status}
          filteredCount={filteredAndSortedRooms.length}
          onSearch={setHeroSearchTerm}
      />
      
       <div className="sticky top-[65px] z-40 bg-background/95 backdrop-blur-sm rounded-xl border shadow-sm mb-6 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
              {/* Filters */}
              <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
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
            <AlertTitle>Алдаа</AlertTitle>
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
         filteredAndSortedRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {filteredAndSortedRooms.map(room => (
                <RoomCard key={room.id} room={room} availableInstances={room.availableInstances} />
            ))}
            </div>
        ) : (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Өрөө олдсонгүй</AlertTitle>
                <AlertDescription>Таны хайлтад тохирох өрөө одоогоор алга байна. Шүүлтүүрээ өөрчилж дахин оролдоно уу.</AlertDescription>
            </Alert>
        )
      ) : (
         <RoomMap rooms={filteredAndSortedRooms} />
      )}
    </div>
  );

    


