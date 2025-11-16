
"use client";

import { Zap, Flame, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { HeroSearch } from './HeroSearch';
import { useEffect, useMemo } from 'react';
import { Room } from '@/lib/data';
import { useSearchParams } from 'next/navigation';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type HotDeal = Room & { discount: number };

type HeroProps = {
    status: 'loading' | 'success' | 'error';
    filteredCount: number;
    onSearch: (term: string) => void;
    hotDeals: HotDeal[];
}

export default function Hero({ status, filteredCount, onSearch, hotDeals }: HeroProps) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search');
  
  useEffect(() => {
    if (initialSearch) {
      onSearch(initialSearch);
    }
  }, [initialSearch, onSearch]);

  const bestDeal = useMemo(() => {
    if (!hotDeals || hotDeals.length === 0) return null;
    return hotDeals.reduce((prev, current) => (prev.discount > current.discount) ? prev : current);
  }, [hotDeals]);

  const handleBestDealClick = () => {
    if (bestDeal) {
      onSearch(bestDeal.hotelName);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden mb-6 h-[400px] md:h-[450px] flex items-center justify-center text-center p-4">
      <Image
        src="https://images.unsplash.com/photo-1590490360182-c33d57733427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxob3RlbCUyMHJvb218ZW58MHx8fHwxNzYyOTI3NzMzfDA&ixlib=rb-4.1.0&q=80&w=1080"
        alt="Night city view from a hotel room"
        fill
        className="object-cover opacity-50"
        priority
        data-ai-hint="hotel room"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
      <div className="relative z-10 text-white w-full px-4">
        <div className="flex items-center justify-center gap-3 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.4)]">
             {bestDeal && (
                 <Popover>
                    <PopoverTrigger asChild>
                       <Badge 
                            variant="destructive" 
                            className="text-sm font-bold cursor-pointer animate-pulse"
                        >
                            <Flame className="w-4 h-4 mr-1.5" />
                            Зад Хямдрал: {bestDeal.discount}%
                        </Badge>
                    </PopoverTrigger>
                    <PopoverContent align="center" className="w-80 bg-background text-foreground">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h4 className="font-medium leading-none text-destructive">Онцгой санал!</h4>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-bold text-foreground">{bestDeal.hotelName}</span>-д <span className="font-bold text-foreground">{bestDeal.roomName}</span> өрөөг <span className="font-bold text-destructive">{bestDeal.discount}%</span>-ийн хямдралтай захиалаарай.
                                </p>
                            </div>
                            <Button onClick={handleBestDealClick} className="w-full">
                                Дэлгэрэнгүй <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mt-4 !leading-tight [text-shadow:0_2px_5px_rgb(0_0_0_/_0.5)]">
          Энэ шөнийн онцгой буудлууд
        </h1>
        <div className='mt-8'>
            <HeroSearch onSearch={onSearch} initialValue={initialSearch ?? ''} />
        </div>
        
         <p className="mt-4 max-w-2xl mx-auto text-base text-white/80 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.4)]">
          {status === 'loading'
            ? "Шилдэг саналуудыг хайж байна..."
            : filteredCount > 0
              ? `${filteredCount} өрөө олдлоо. Доорх шүүлтүүрээр хайлтаа нарийвчлаарай.`
              : "Таны хайлтад тохирох өрөө олдсонгүй."}
        </p>
      </div>
    </div>
  );
}
