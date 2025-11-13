import { BedDouble, Filter, ArrowUpDown, MapPin, Star, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { Separator } from '@/components/ui/separator';
import type { SortOption } from '@/lib/data';
import { cn } from '@/lib/utils';

type HeaderProps = {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
};

const sortOptionsConfig: { value: SortOption; label: string; icon: React.ElementType }[] = [
    { value: 'distance', label: 'Distance', icon: MapPin },
    { value: 'price', label: 'Price', icon: DollarSign },
    { value: 'rating', label: 'Rating', icon: Star },
];

export default function Header({ sortOption, onSortChange }: HeaderProps) {
  const ActiveSortIcon = sortOptionsConfig.find(o => o.value === sortOption)?.icon || ArrowUpDown;
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="flex items-center gap-3 font-bold">
          <BedDouble className="h-7 w-7 text-primary" />
          <span className="text-2xl font-headline tracking-tight">XRoom Tonight</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                    <Filter className="mr-2" />
                    Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your results.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                 {/* TODO: Add filter options here */}
                 <p className="text-sm text-muted-foreground">Filter options will be added soon.</p>
                </div>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <ActiveSortIcon className="mr-2" />
                        Sort by
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
                        {sortOptionsConfig.map(option => (
                             <DropdownMenuRadioItem key={option.value} value={option.value} className="gap-2">
                                <option.icon className="text-muted-foreground" />
                                {option.label}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="ghost">
                <MapPin className="mr-2" />
                Map View
            </Button>
        </div>
      </div>
    </header>
  );
}
