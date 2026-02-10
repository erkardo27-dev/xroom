

"use client";

import Image from 'next/image';
import { HeroSearch } from './HeroSearch';

type HeroProps = {
  status: 'loading' | 'success' | 'error';
  filteredCount: number;
  onSearch: (term: string) => void;
  onClear: () => void;
  initialSearchValue: string;
}

import { ChevronDown } from 'lucide-react';

export default function Hero({ status, filteredCount, onSearch, onClear, initialSearchValue }: HeroProps) {
  return (
    <div className="relative w-full overflow-hidden mb-0 h-[600px] md:h-[750px] flex items-center justify-center text-center p-4 shadow-xl bg-black">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />

      <Image
        src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070&auto=format&fit=crop"
        alt="Luxury hotel room with city view"
        fill
        className="object-cover opacity-90"
        priority
      />

      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 w-full max-w-5xl px-4 flex flex-col items-center animate-in fade-in zoom-in duration-1000 ease-out">

        <h1 className="font-extrabold tracking-tight text-white drop-shadow-2xl leading-none mb-8">
          <span className="block text-4xl sm:text-5xl lg:text-7xl mb-3 tracking-wide">
            Таны тав тух,
          </span>
          <span className="block text-4xl sm:text-6xl lg:text-8xl text-white/90">
            Бидний <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-400 to-red-500 italic pr-2">шийдэл</span>
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-lg tracking-wide">
          Хамгийн шилдэг зочид буудлууд, амралтын газруудаас сонголтоо хийн, хормын дотор баталгаажуул.
        </p>

        <div className="w-full max-w-2xl mx-auto drop-shadow-2xl transform hover:scale-[1.01] transition-transform duration-500">
          <HeroSearch
            onSearch={onSearch}
            onClear={onClear}
            initialValue={initialSearchValue}
          />
        </div>

        <div className="mt-10 flex items-center gap-3 text-sm font-medium text-white/90 bg-white/5 px-6 py-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/10 transition-colors cursor-default">
          <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_15px_currentColor] ${status === 'loading' ? 'bg-yellow-400 animate-pulse text-yellow-400' : filteredCount > 0 ? 'bg-emerald-400 text-emerald-400' : 'bg-red-400 text-red-400'}`} />
          {status === 'loading'
            ? "Хайж байна..."
            : filteredCount > 0
              ? `${filteredCount} өрөө бэлэн байна`
              : "Өрөө олдсонгүй"}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce duration-2000">
        <ChevronDown className="h-8 w-8 text-white/50" />
      </div>
    </div>
  );
}
