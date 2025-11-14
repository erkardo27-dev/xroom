import { Zap } from 'lucide-react';
import Image from 'next/image';

type HeroProps = {
    status: 'loading' | 'success' | 'error';
    filteredCount: number;
}

export default function Hero({ status, filteredCount }: HeroProps) {
  return (
    <div className="relative rounded-xl overflow-hidden mb-8 h-80 flex items-center justify-center text-center p-4">
      <Image
        src="https://images.unsplash.com/photo-1590490360182-c33d57733427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxob3RlbCUyMHJvb218ZW58MHx8fHwxNzYyOTI3NzMzfDA&ixlib=rb-4.1.0&q=80&w=1080"
        alt="Night city view from a hotel room"
        fill
        className="object-cover"
        priority
        data-ai-hint="hotel room"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent" />
      <div className="relative z-10 text-white">
        <p className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-yellow-300" />
          Сүүлчийн минутын хямдрал
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mt-2 !leading-tight text-shadow-lg">
          Энэ шөнийн онцгой буудлууд
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-white/80">
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
