
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
  PopoverTrigger,
} from "@/components/ui/popover";

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

  return (
    <div className="relative w-full max-w-2xl mx-auto">
       <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Зочид буудлын нэр, байршлаар хайх..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsPopoverOpen(true)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full h-14 pl-12 pr-32 rounded-full shadow-lg text-base"
                />
                <Button 
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-full px-6 font-bold"
                >
                    Хайх
                </Button>
            </div>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-2 mt-2" align="start">
          <div className="flex flex-col space-y-1">
            {filteredSuggestions.length > 0 ? (
                filteredSuggestions.slice(0, 7).map((suggestion) => (
                    <Button
                        key={suggestion}
                        variant="ghost"
                        className="justify-start"
                        onClick={() => handleSuggestionClick(suggestion)}
                    >
                        {suggestion}
                    </Button>
                ))
            ) : (
                <p className="p-2 text-center text-sm text-muted-foreground">Илэрц олдсонгүй</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
