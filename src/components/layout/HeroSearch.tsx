
"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useRoom } from "@/context/RoomContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { locations } from "@/lib/data";
import {
  Popover,
  PopoverContent,
  PopoverAnchor
} from "@/components/ui/popover";

type HeroSearchProps = {
  onSearch: (term: string) => void;
  onClear: () => void;
  initialValue?: string;
};

export function HeroSearch({ onSearch, onClear, initialValue = '' }: HeroSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { rooms } = useRoom();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const hotelNames = useMemo(() => {
    const names = new Set(rooms.map(room => room.hotelName));
    return Array.from(names);
  }, [rooms]);

  const allSuggestions = useMemo(() => [...locations, ...hotelNames], [hotelNames]);

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) {
      return allSuggestions.slice(0, 7);
    }
    return allSuggestions.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 7);
  }, [allSuggestions, searchTerm]);

  const handleSearch = useCallback(() => {
    onSearch(searchTerm);
    setIsPopoverOpen(false);
    inputRef.current?.blur();
  }, [onSearch, searchTerm]);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    onSearch(suggestion);
    setIsPopoverOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setSearchTerm("");
    onClear();
    inputRef.current?.focus();
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverAnchor>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Зочид буудлын нэр, байршлаар хайх..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsPopoverOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="w-full h-14 pl-12 pr-48 rounded-full shadow-lg text-base text-black"
            />
            {searchTerm && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    className="absolute right-[110px] top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                    aria-label="Clear search"
                >
                    <X className="h-5 w-5 text-muted-foreground"/>
                </Button>
            )}
            <Button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-full px-6 font-bold"
            >
              Хайх
            </Button>
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0 mt-2"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {filteredSuggestions.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden" >
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="relative flex cursor-default select-none items-center rounded-sm px-4 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground w-full text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm">Илэрц олдсонгүй</div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
