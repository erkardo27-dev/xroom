import { BedDouble } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="flex items-center gap-3 font-bold">
          <BedDouble className="h-7 w-7 text-primary" />
          <span className="text-2xl font-headline tracking-tight">XRoom Tonight</span>
        </Link>
      </div>
    </header>
  );
}
