import { BedDouble, Filter, ArrowUpDown, Map as MapIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
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

type HeaderProps = {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
};

export default function Header({ sortOption, onSortChange }: HeaderProps) {
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
                    Шүүлтүүр
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Шүүлтүүр</SheetTitle>
                  <SheetDescription>
                    Үр дүнгээ нарийвчлан харуулна уу.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                 {/* TODO: Add filter options here */}
                 <p className="text-sm text-muted-foreground">Шүүлтүүрийн сонголтууд удахгүй нэмэгдэнэ.</p>
                </div>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <ArrowUpDown className="mr-2" />
                        Эрэмбэлэх
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
                        <DropdownMenuRadioItem value="distance">Зай</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="price">Үнэ</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="rating">Үнэлгээ</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="ghost">
                <MapIcon className="mr-2" />
                Газрын зураг
            </Button>
        </div>
      </div>
    </header>
  );
}
