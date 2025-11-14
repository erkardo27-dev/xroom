
import { Zap } from 'lucide-react';
import Image from 'next/image';
import { HeroSearch } from './HeroSearch';

type HeroProps = {
    status: 'loading' | 'success' | 'error';
    filteredCount: number;
    onSearch: (term: string) => void;
}

export default function Hero({ status, filteredCount, onSearch }: HeroProps) {
  return (
    <div className="relative rounded-xl overflow-hidden mb-6 h-[300px] md:h-[350px] flex items-center justify-center text-center p-4">
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
        <p className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center justify-center gap-2 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.4)]">
          <Zap className="w-4 h-4 text-yellow-300" />
          Сүүлчийн минутын хямдрал
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mt-2 !leading-tight [text-shadow:0_2px_5px_rgb(0_0_0_/_0.5)]">
          Энэ шөнийн онцгой буудлууд
        </h1>
        <div className='mt-8'>
            <HeroSearch onSearch={onSearch} />
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
