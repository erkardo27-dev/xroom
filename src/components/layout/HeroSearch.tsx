
"use client";

import { useMemo, useState, useRef } from "react";
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
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

type HeroSearchProps = {
  onSearch: (term: string) => void;
};

export function HeroSearch({ onSearch }: HeroSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const { rooms } = useRoom();
  const inputRef = useRef<HTMLInputElement>(null);


  const hotelNames = useMemo(() => {
    const names = new Set(rooms.map(room => room.hotelName));
    return Array.from(names);
  }, [rooms]);

  const allSuggestions = useMemo(() => [...locations, ...hotelNames], [hotelNames]);
  
  const handleSearch = () => {
    onSearch(searchTerm);
    setOpen(false);
    inputRef.current?.blur();
  };
  
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Зочид буудлын нэр, байршлаар хайх..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (!open) {
                setOpen(true)
              }
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
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
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0 mt-2" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
                <CommandEmpty>Илэрц олдсонгүй</CommandEmpty>
                {allSuggestions.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 7).map((suggestion) => (
                     <CommandItem
                        key={suggestion}
                        value={suggestion}
                        onSelect={(currentValue) => {
                            setSearchTerm(currentValue)
                            onSearch(currentValue)
                            setOpen(false)
                            inputRef.current?.blur()
                        }}
                     >
                        {suggestion}
                    </CommandItem>
                ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
