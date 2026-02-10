"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Amenity, Room, SortOption, RoomInstance } from '@/lib/data';
import { RoomCard } from './RoomCard';
import { RoomCardSkeleton } from './RoomCardSkeleton';
import { RoomMap } from './RoomMap';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, List, MapPin, DollarSign, Heart, SlidersHorizontal, X, Tag, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Hero from '@/components/layout/Hero';
import { useRoom } from '@/context/RoomContext';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'map';

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
  const [showOnlyHotDeals, setShowOnlyHotDeals] = useState(false);

  // Filter state
  const [priceRange, setPriceRange] = useState<number[]>([0, MAX_PRICE]);
  const [distanceLimit, setDistanceLimit] = useState<number[]>([MAX_DISTANCE]);
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);
  const [heroSearchTerm, setHeroSearchTerm] = useState<string>(initialSearch ?? "");

  const handleClearSearch = () => {
    setHeroSearchTerm("");
    setShowOnlyHotDeals(false);
  };

  useEffect(() => {
    if (initialSearch) {
      setHeroSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  const toggleHotDeals = () => {
    const isActivating = !showOnlyHotDeals;
    setShowOnlyHotDeals(isActivating);
    if (isActivating) {
      // When activating hot deals, clear other filters for a clean slate
      setHeroSearchTerm("");
      setPriceRange([0, MAX_PRICE]);
      setDistanceLimit([MAX_DISTANCE]);
      setSelectedAmenities([]);
    }
  }

  const filteredAndSortedRooms = useMemo(() => {
    let filtered = availableRoomsByType;

    if (showOnlyHotDeals) {
      filtered = filtered.filter(room => room.originalPrice && room.originalPrice > room.price);

      // Sort by discount percentage, descending
      return filtered.sort((a, b) => {
        const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
        const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
        return discountB - discountA;
      });
    }

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

    // Final deduplication guard to prevent "Duplicate Key" errors in the UI
    const uniqueMap = new Map();
    sorted.forEach(room => {
      if (!uniqueMap.has(room.id)) {
        uniqueMap.set(room.id, room);
      }
    });

    return Array.from(uniqueMap.values());
  }, [availableRoomsByType, sortOption, priceRange, distanceLimit, selectedAmenities, heroSearchTerm, showOnlyHotDeals]);

  return (
    <div className="flex flex-col w-full pb-12">
      <div className="w-full">
        <Hero
          status={status}
          filteredCount={filteredAndSortedRooms.length}
          onSearch={setHeroSearchTerm}
          onClear={handleClearSearch}
          initialSearchValue={heroSearchTerm}
        />
      </div>

      <div className="container mx-auto px-4 md:px-8 -mt-8 relative z-10">
        <div className="sticky top-4 z-40 mb-8 transition-all duration-300">
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl shadow-black/5 rounded-full p-2 mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-2 md:gap-4 transition-all hover:bg-white/90 dark:hover:bg-black/90 hover:shadow-2xl hover:scale-[1.01]">

            <Button
              variant={showOnlyHotDeals ? "default" : "ghost"}
              size="lg"
              className={cn(
                "rounded-full px-6 transition-all duration-300 w-full md:w-auto",
                showOnlyHotDeals
                  ? "bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 border-0"
                  : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
              onClick={toggleHotDeals}
            >
              <Tag className={cn("mr-2 h-4 w-4 transition-transform", showOnlyHotDeals && "animate-pulse")} />
              <span className="font-bold">{showOnlyHotDeals ? "🔥 Хямдарсан!" : "Хямдрал"}</span>
            </Button>

            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

            <div className="flex-1 flex items-center gap-4 px-2 w-full md:w-auto overflow-x-auto no-scrollbar mask-gradient">
              <div className="flex items-center gap-2 min-w-max">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Үнэ:</span>
                <Slider
                  className="w-32"
                  min={0}
                  max={MAX_PRICE}
                  step={10000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  disabled={showOnlyHotDeals}
                />
                <span className="text-xs font-medium w-16 text-right tabular-nums">
                  {priceRange[1] === MAX_PRICE ? "Max" : `${(priceRange[1] / 1000).toFixed(0)}k`}
                </span>
              </div>

              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

              <div className="flex items-center gap-2 min-w-max">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Зай:</span>
                <Slider
                  className="w-24"
                  min={1}
                  max={MAX_DISTANCE}
                  step={1}
                  value={distanceLimit}
                  onValueChange={setDistanceLimit}
                  disabled={showOnlyHotDeals}
                />
                <span className="text-xs font-medium w-12 text-right tabular-nums">
                  {distanceLimit[0]}км
                </span>
              </div>
            </div>

            <div className="hidden md:block h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

            <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-full w-full md:w-auto justify-center md:justify-start">
              <ToggleGroup
                type="single"
                value={sortOption}
                onValueChange={(value) => {
                  if (value) setSortOption(value as SortOption);
                }}
                className="gap-0"
                disabled={showOnlyHotDeals}
              >
                {sortOptionsConfig.map(option => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="h-8 rounded-full px-3 text-xs data-[state=on]:bg-white dark:data-[state=on]:bg-zinc-800 data-[state=on]:text-primary data-[state=on]:shadow-sm transition-all"
                  >
                    <option.icon className="h-3.5 w-3.5 mr-1" />
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="rounded-full h-10 w-10 shrink-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {viewMode === 'list' ? <MapPin className="h-5 w-5" /> : <List className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {status === 'error' && error && (
          <Alert variant="destructive" className="mb-8 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Алдаа</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === 'loading' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-3xl h-[400px]" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        ) : viewMode === 'list' ? (
          filteredAndSortedRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 px-2 min-h-[50vh]">
              {filteredAndSortedRooms.map((room, index) => (
                <div
                  key={room.id}
                  className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <RoomCard room={room} availableInstances={room.availableInstances} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
              <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-full mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Өрөө олдсонгүй</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Таны хайлтад тохирох өрөө одоогоор алга байна. Шүүлтүүрээ өөрчилж дахин оролдоно уу.
              </p>
              <Button variant="link" onClick={handleClearSearch} className="mt-4 text-primary">
                Шүүлтүүрийг цэвэрлэх
              </Button>
            </div>
          )
        ) : (
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-500 h-[600px]">
            <RoomMap rooms={filteredAndSortedRooms} />
          </div>
        )}
      </div>
    </div>
  );
}
