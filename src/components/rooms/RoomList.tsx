
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Amenity, Room, SortOption, RoomInstance } from '@/lib/data';
import { amenityOptions } from '@/lib/data';
import { RoomCard } from './RoomCard';
import { RoomCardSkeleton } from './RoomCardSkeleton';
import { RoomMap } from './RoomMap';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, List, MapPin, DollarSign, Heart, Sparkles, SlidersHorizontal, Flame } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Hero from '@/components/layout/Hero';
import { useRoom } from '@/context/RoomContext';
import { startOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { toggleArrayItem } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { useSearchParams } from 'next/navigation';
import { Badge } from '../ui/badge';

type ViewMode = 'list' | 'map';
type HotDeal = Room & { discount: number };

const sortOptionsConfig: { value: SortOption; label: string; icon: React.ElementType }[] = [
    { value: 'likes', label: 'Таалагдсан', icon: Heart },
    { value: 'distance', label: 'Ойрхон', icon: MapPin },
    { value: 'price', label: 'Хямд', icon: DollarSign },
];

const MAX_PRICE = 1000000;
const MAX_DISTANCE = 20;


export default function RoomList() {
  const { availableRoomsByType, status, error } = useRoom();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search');
  
  const [sortOption, setSortOption] = useState<SortOption>('likes');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Filter state
  const [priceRange, setPriceRange] = useState<number[]>([0, MAX_PRICE]);
  const [distanceLimit, setDistanceLimit] = useState<number[]>([MAX_DISTANCE]);
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);
  const [heroSearchTerm, setHeroSearchTerm] = useState<string>(initialSearch ?? "");

  const handleClearSearch = () => {
    setHeroSearchTerm("");
  };

  const hotDeals = useMemo(() => {
    return availableRoomsByType
      .filter(room => room.originalPrice && room.originalPrice > room.price)
      .map(room => ({
          ...room,
          discount: Math.round(((room.originalPrice! - room.price) / room.originalPrice!) * 100)
      }))
      .sort((a, b) => b.discount - a.discount);
  }, [availableRoomsByType]);
  
  useEffect(() => {
    if (initialSearch) {
      setHeroSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  const filteredAndSortedRooms = useMemo(() => {
    let filtered = availableRoomsByType;

    if (heroSearchTerm) {
        const lowercasedTerm = heroSearchTerm.toLowerCase();
        filtered = filtered.filter(room => 
            room.hotelName.toLowerCase().includes(lowercasedTerm) ||
            room.location.toLowerCase().includes(lowercasedTerm)
        );
    }
      
    filtered = filtered.filter(room => 
        room.price >= priceRange[0] &&
        (priceRange[1] === MAX_PRICE ? true : room.price <= priceRange[1]) &&
        room.distance <= distanceLimit[0] &&
        (selectedAmenities.length === 0 || selectedAmenities.every(a => room.amenities.includes(a)))
    );

    const sorted = [...filtered];
    switch (sortOption) {
      case 'distance':
        sorted.sort((a, b) => a.distance - b.distance);
        break;
      case 'price':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'likes':
        sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
    }
    return sorted;
  }, [availableRoomsByType, sortOption, priceRange, distanceLimit, selectedAmenities, heroSearchTerm]);
  
  const handleDealClick = (hotelName: string) => {
    setHeroSearchTerm(hotelName);
  };
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <Hero 
          status={status}
          filteredCount={filteredAndSortedRooms.length}
          onSearch={setHeroSearchTerm}
          onClear={handleClearSearch}
          initialSearchValue={heroSearchTerm}
      />

      <div className="sticky top-[65px] z-40 bg-background/95 backdrop-blur-sm rounded-xl border shadow-sm mb-6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {hotDeals.length > 0 && (
                  <Popover>
                      <PopoverTrigger asChild>
                           <Button variant="outline" className="h-10 text-left relative border-destructive/50 text-destructive bg-destructive/10 hover:bg-destructive/20 hover:text-destructive">
                              <Flame className="mr-2 h-4 w-4 shrink-0" />
                              <span className='font-bold'>Зад Хямдрал</span>
                              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                                  {hotDeals.length}
                              </span>
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-80 p-3'>
                           <div className="space-y-3">
                              <h4 className="font-bold text-center text-lg">🔥 Зад Хямдралууд</h4>
                              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                  {hotDeals.map(deal => (
                                      <Button 
                                          key={deal.id}
                                          variant="ghost" 
                                          className="w-full h-auto justify-between p-3"
                                          onClick={() => handleDealClick(deal.hotelName)}
                                      >
                                          <div className='text-left'>
                                              <p className="font-semibold">{deal.hotelName}</p>
                                              <p className='text-xs text-muted-foreground'>{deal.roomName}</p>
                                          </div>
                                          <Badge variant="destructive" className="text-sm">
                                              {deal.discount}%
                                          </Badge>
                                      </Button>
                                  ))}
                              </div>
                          </div>
                      </PopoverContent>
                  </Popover>
                )}

                <div className="grid grid-cols-1 gap-2 flex-1 min-w-[200px] md:min-w-[300px]">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                            <Label htmlFor="price-range" className="font-semibold text-xs">Үнийн хязгаар</Label>
                            <span className="font-medium text-primary text-xs">{priceRange[0].toLocaleString()}₮ - {priceRange[1] === MAX_PRICE ? `${(MAX_PRICE / 1000)}k+₮` : `${priceRange[1].toLocaleString()}₮`}</span>
                        </div>
                        <Slider
                          id="price-range"
                          min={0}
                          max={MAX_PRICE}
                          step={10000}
                          value={priceRange}
                          onValueChange={setPriceRange}
                        />
                    </div>
                     <div className="space-y-1">
                         <div className="flex justify-between items-center text-sm">
                            <Label htmlFor="distance-limit" className="font-semibold text-xs">Зай</Label>
                            <span className="font-medium text-primary text-xs">{distanceLimit[0]} км хүртэл</span>
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

            <div className="flex items-center justify-end gap-2">
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
                
                <Separator orientation="vertical" className="h-6 mx-1" />

                <Button
                  variant="outline"
                  onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                  className="h-9 w-28"
                >
                 {viewMode === 'list' ? (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Газрын зураг
                    </>
                 ) : (
                    <>
                      <List className="h-4 w-4 mr-2" />
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
}
