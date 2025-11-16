
"use client";

import { useMemo, useState } from "react";
import { useRoom } from "@/context/RoomContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { locations } from "@/lib/data";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

type HeroSearchProps = {
  onSearch: (term: string) => void;
};

export function HeroSearch({ onSearch }: HeroSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { rooms } = useRoom();

  const hotelNames = useMemo(() => {
    const names = new Set(rooms.map(room => room.hotelName));
    return Array.from(names);
  }, [rooms]);

  const allSuggestions = useMemo(() => [...locations, ...hotelNames], [hotelNames]);

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) {
      return allSuggestions;
    }
    return allSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allSuggestions]);

  const handleSearch = () => {
    onSearch(searchTerm);
    setIsPopoverOpen(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    onSearch(suggestion);
    setIsPopoverOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isPopoverOpen) {
      setIsPopoverOpen(true);
    }
  }

  const handleInputFocus = () => {
    if (!isPopoverOpen) {
        setIsPopoverOpen(true);
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverAnchor asChild>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Зочид буудлын нэр, байршлаар хайх..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearch();
                        }
                    }}
                    className="w-full h-14 pl-12 pr-32 rounded-full shadow-lg text-base"
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
            className="w-[--radix-popover-trigger-width] p-0 mt-2" 
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()} // Prevent content from stealing focus
        >
          <Command>
            <CommandList>
                {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.slice(0, 7).map((suggestion) => (
                         <CommandItem
                            key={suggestion}
                            onSelect={() => handleSuggestionClick(suggestion)}
                            value={suggestion}
                         >
                            {suggestion}
                        </CommandItem>
                    ))
                ) : (
                    <CommandEmpty>Илэрц олдсонгүй</CommandEmpty>
                )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
