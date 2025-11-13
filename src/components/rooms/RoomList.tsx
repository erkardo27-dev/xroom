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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  // Temporary filter state for the sheet
  const [tempPriceRange, setTempPriceRange] = useState<number[]>([0, MAX_PRICE]);
  const [tempDistanceLimit, setTempDistanceLimit] = useState<number[]>([15]);
  const [tempMinRating, setTempMinRating] = useState<number[]>([3]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);


  // Actual filter state
  const [priceRange, setPriceRange] = useState<number[]>([0, MAX_PRICE]);
  const [distanceLimit, setDistanceLimit] = useState<number[]>([15]);
  const [minRating, setMinRating] = useState<number[]>([3]);

  useEffect(() => {
    // Sync temp filters when sheet opens
    if (isSheetOpen) {
      setTempPriceRange(priceRange);
      setTempDistanceLimit(distanceLimit);
      setTempMinRating(minRating);
    }
  }, [isSheetOpen, priceRange, distanceLimit, minRating]);


  const handleApplyFilters = () => {
    setPriceRange(tempPriceRange);
    setDistanceLimit(tempDistanceLimit);
    setMinRating(tempMinRating);
    setIsSheetOpen(false);
  };
  
  const resetFilters = () => {
    const defaultPrice = [0, MAX_PRICE];
    const defaultDistance = [15];
    const defaultRating = [3];
    
    setTempPriceRange(defaultPrice);
    setTempDistanceLimit(defaultDistance);
    setTempMinRating(defaultRating);

    setPriceRange(defaultPrice);
    setDistanceLimit(defaultDistance);
    setMinRating(defaultRating);

    setIsSheetOpen(false);
  };


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
  
  const isFilterActive = priceRange[0] !== 0 || priceRange[1] !== MAX_PRICE || distanceLimit[0] !== 15 || minRating[0] !== 3;
  const activeFilterCount = (priceRange[0] !== 0 || priceRange[1] !== MAX_PRICE ? 1 : 0) + (distanceLimit[0] !== 15 ? 1 : 0) + (minRating[0] !== 3 ? 1 : 0);

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-full">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-primary font-semibold">Сүүлчийн минутын хямдрал</p>
            <h2 className="text-3xl font-bold font-headline tracking-tight">
              {filteredAndSortedRooms.length} өрөө олдлоо
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
             <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" className="flex-1 md:flex-none justify-center text-base py-6 relative">
                        <SlidersHorizontal className="mr-2 h-5 w-5" />
                        Шүүлтүүр
                        {isFilterActive && (
                            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle className="text-2xl">Шүүлтүүр</SheetTitle>
                    </SheetHeader>
                    <div className="py-8 space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="price-range" className="font-semibold text-card-foreground/80 text-base">Үнийн хязгаар</Label>
                                <span className="text-sm font-medium text-primary">${tempPriceRange[0]} - ${tempPriceRange[1] === MAX_PRICE ? `${MAX_PRICE}+` : tempPriceRange[1]}</span>
                            </div>
                            <Slider
                              id="price-range"
                              min={0}
                              max={MAX_PRICE}
                              step={10}
                              value={tempPriceRange}
                              onValueChange={setTempPriceRange}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="distance-limit" className="font-semibold text-card-foreground/80 text-base">Зай</Label>
                                <span className="text-sm font-medium text-primary">{tempDistanceLimit[0]} км хүртэл</span>
                            </div>
                            <Slider
                              id="distance-limit"
                              min={1}
                              max={20}
                              step={1}
                              value={tempDistanceLimit}
                              onValueChange={setTempDistanceLimit}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="min-rating" className="font-semibold text-card-foreground/80 text-base">Үнэлгээ</Label>
                                <span className="text-sm font-medium text-primary">{tempMinRating[0].toFixed(1)}+ од</span>
                            </div>
                             <Slider
                              id="min-rating"
                              min={1}
                              max={5}
                              step={0.1}
                              value={tempMinRating}
                              onValueChange={setTempMinRating}
                            />
                        </div>
                    </div>
                     <SheetFooter className="gap-2 sm:justify-between">
                          <Button variant="ghost" onClick={resetFilters} className="sm:mr-auto">
                            <X className="mr-2" />
                            Цэвэрлэх
                          </Button>
                          <SheetClose asChild>
                            <Button variant="outline">Болих</Button>
                          </SheetClose>
                          <Button onClick={handleApplyFilters}>Хэрэглэх</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <div className="flex-1 md:flex-none">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-auto py-1">
                  <TabsTrigger value="list" className="py-2.5 text-base gap-2"><List /> Жагсаалт</TabsTrigger>
                  <TabsTrigger value="map" className="py-2.5 text-base gap-2"><MapPin /> Газрын зураг</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1 md:flex-none justify-center text-base py-6">
                        <ActiveSortIcon className="mr-2 h-5 w-5 text-muted-foreground" />
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
