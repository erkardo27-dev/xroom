
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
  PopoverAnchor,
  PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay } from "date-fns";
import { mn } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { DateRange } from "react-day-picker";

type HeroSearchProps = {
  onSearch: (term: string) => void;
  onClear: () => void;
  initialValue?: string;
};

export function HeroSearch({ onSearch, onClear, initialValue = '' }: HeroSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { rooms, selectedDateRange, setSelectedDateRange } = useRoom();
  const [localDate, setLocalDate] = useState<DateRange | undefined>(selectedDateRange);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isPopoverOpen) {
      console.log('Popover opened, syncing localDate:', selectedDateRange);
      setLocalDate(selectedDateRange);
    }
  }, [isPopoverOpen]); // Only sync when opening, not when global state updates during selection

  const hotelNames = useMemo(() => {
    if (!rooms) return [];
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
        <PopoverAnchor asChild>
          <div className="flex items-center w-full h-14 bg-white rounded-full shadow-lg transition-all focus-within:ring-2 focus-within:ring-primary/20">

            <div className="pl-4 pr-2 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>

            <Input
              ref={inputRef}
              type="text"
              placeholder="Хайх..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsPopoverOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="flex-1 h-full border-none shadow-none focus-visible:ring-0 px-2 text-base bg-transparent rounded-none"
            />

            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-8 w-8 rounded-full mr-1 hover:bg-zinc-100"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}

            <div className="h-8 w-px bg-zinc-200 mx-1" />

            <div className="flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-zinc-50 rounded-full flex items-center gap-2 mr-1"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span className="text-sm font-medium whitespace-nowrap hidden sm:inline-block">
                      {format(selectedDateRange.from, "MM/dd")} - {format(selectedDateRange.to, "MM/dd")}
                    </span>
                    {/* Show simpler date on mobile if needed, or keep hidden/icon only */}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="end">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-center pb-2 border-b">
                      <span className="text-sm font-medium text-center">
                        {localDate?.from ? (
                          localDate.to ? (
                            <span className="text-green-600 font-bold">
                              {format(localDate.from, "M/d")} - {format(localDate.to, "M/d")} ({Math.ceil((localDate.to.getTime() - localDate.from.getTime()) / (1000 * 60 * 60 * 24))} шөнө)
                            </span>
                          ) : (
                            <span className="text-primary font-semibold">Дуусах өдрөө сонгоно уу</span>
                          )
                        ) : (
                          <span className="text-muted-foreground">Эхлэх өдрөө сонгоно уу</span>
                        )}
                      </span>
                    </div>
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={localDate?.from}
                      selected={localDate}
                      onDayClick={(day, modifiers) => {
                        if (modifiers.disabled) return;
                        if (localDate?.from && localDate?.to) {
                          setLocalDate({ from: day, to: undefined });
                          return;
                        }
                        if (!localDate?.from) {
                          setLocalDate({ from: day, to: undefined });
                          return;
                        }
                        if (day < localDate.from) {
                          setLocalDate({ from: day, to: undefined });
                        } else if (day.getTime() === localDate.from.getTime()) {
                          // Same day click
                        } else {
                          const newRange = { from: localDate.from, to: day };
                          setLocalDate(newRange);
                          setSelectedDateRange(newRange);
                          setIsPopoverOpen(false);
                        }
                      }}
                      onSelect={() => { }}
                      numberOfMonths={2}
                      locale={mn}
                      disabled={(date) => date < startOfDay(new Date())}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Button
              onClick={handleSearch}
              className="h-10 rounded-full px-6 font-bold m-2 ml-0 shadow-md"
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
