
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

export default function Hero({ status, filteredCount, onSearch, onClear, initialSearchValue }: HeroProps) {

  return (
    <div className="relative rounded-xl overflow-hidden mb-6 h-[350px] flex items-center justify-center text-center p-4">
      <Image
        src="https://images.unsplash.com/photo-1590490360182-c33d57733427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxob3RlbCUyMHJvb218ZW58MHx8fHwxNzYyOTI3NzMzfDA&ixlib=rb-4.1.0&q=80&w=1080"
        alt="Night city view from a hotel room"
        fill
        className="object-cover opacity-30"
        priority
        data-ai-hint="hotel room"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30" />
      <div className="relative z-10 text-white w-full px-4">
        
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl !leading-tight [text-shadow:0_1px_2px_rgb(0_0_0_/_0.3)]">
          XRoom-оор захиалах нь хялбар, хурдан, халдашгүй
        </h1>

        <div className={'mt-8'}>
            <HeroSearch onSearch={onSearch} initialValue={initialSearchValue} onClear={onClear} />
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
