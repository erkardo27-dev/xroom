
"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRoom } from "@/context/RoomContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { locations } from "@/lib/data";
import {
  Popover,
  PopoverContent,
  PopoverAnchor
} from "@/components/ui/popover";

type HeroSearchProps = {
  onSearch: (term: string) => void;
};

export function HeroSearch({ onSearch }: HeroSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { rooms } = useRoom();
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  const handleSearch = () => {
    onSearch(searchTerm);
    setIsPopoverOpen(false);
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    onSearch(suggestion);
    setIsPopoverOpen(false);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
              className="w-full h-14 pl-12 pr-32 rounded-full shadow-lg text-base text-black"
            />
            <Button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-full px-6 font-bold"
            >
              Хайх
            </Button>
          </div>
        </PopoverAnchor>
        <PopoverContent
          ref={popoverRef}
          className="w-[--radix-popover-trigger-width] p-0 mt-2"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {filteredSuggestions.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
              {filteredSuggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                >
                  {suggestion}
                </div>
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
