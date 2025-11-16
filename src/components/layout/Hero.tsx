
"use client";

import { Zap, Flame, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { HeroSearch } from './HeroSearch';
import { useEffect, useMemo, useState } from 'react';
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
    onClearSearch: () => void;
    hotDeals: HotDeal[];
}

export default function Hero({ status, filteredCount, onSearch, onClearSearch, hotDeals }: HeroProps) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search');
  
  useEffect(() => {
    if (initialSearch) {
      onSearch(initialSearch);
    }
  }, [initialSearch, onSearch]);
  
  const [dealIndex, setDealIndex] = useState(0);

  useEffect(() => {
    if (hotDeals.length > 1) {
      const interval = setInterval(() => {
        setDealIndex((prevIndex) => (prevIndex + 1) % hotDeals.length);
      }, 5000); // Change deal every 5 seconds

      return () => clearInterval(interval);
    }
  }, [hotDeals.length]);
  
  const bestDeal = useMemo(() => {
    if (!hotDeals || hotDeals.length === 0) return null;
    return hotDeals[dealIndex];
  }, [hotDeals, dealIndex]);

  const handleDealClick = (hotelName: string) => {
    onSearch(hotelName);
  };
  
  return (
    <div className="relative rounded-xl overflow-hidden mb-6 h-[350px] flex items-center justify-center text-center p-4">
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
        
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl !leading-tight [text-shadow:0_2px_5px_rgb(0_0_0_/_0.5)]">
          Энэ шөнийн онцгой буудлууд
        </h1>

        {bestDeal && (
          <div className="mt-6 mb-8 max-w-2xl mx-auto">
             <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="w-full h-auto text-base text-white bg-destructive/20 hover:bg-destructive/30 backdrop-blur-sm rounded-full py-2 px-4 border border-destructive/50 shadow-lg hover:scale-[1.02] transition-all duration-300">
                      <span className='mr-2'>🔥</span> 
                      <strong>Зад Хямдрал:</strong> 
                      <span className="mx-1.5 font-semibold">{bestDeal.hotelName}-д</span>
                      <span className="font-bold text-yellow-300">{bestDeal.discount}%</span>
                      <span className="ml-1.5 hidden sm:inline">хямдарлаа. Яараарай!</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-[90vw] max-w-md bg-background/80 backdrop-blur-md border-border/50 text-foreground p-3">
                    <div className="space-y-3">
                        <h4 className="font-bold text-center text-lg">🔥 Зад Хямдралууд</h4>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                            {hotDeals.map(deal => (
                                <Button 
                                    key={deal.id}
                                    variant="ghost" 
                                    className="w-full h-auto justify-between p-3"
                                    onClick={() => handleDealClick(deal.hotelName)}
                                >
                                    <div className='text-left'>
                                        <p className="font-semibold">{deal.hotelName}</p>
                                        <p className='text-xs text-muted-foreground'>{deal.roomName}</p>
                                    </div>
                                    <Badge variant="destructive" className="text-sm">
                                        {deal.discount}%
                                    </Badge>
                                </Button>
                            ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
          </div>
        )}

        <div className={!bestDeal ? 'mt-8' : 'mt-0'}>
            <HeroSearch onSearch={onSearch} initialValue={initialSearch ?? ''} onClear={onClearSearch} />
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
