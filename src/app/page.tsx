"use client";

import { useState } from 'react';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import HotelList from '@/components/hotels/HotelList';
import type { SortOption } from '@/lib/data';

export default function Home() {
  const [sortOption, setSortOption] = useState<SortOption>('distance');
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header sortOption={sortOption} onSortChange={setSortOption} />
      <main className="flex-1">
        <HotelList sortOption={sortOption} />
      </main>
      <Footer />
    </div>
  );
}
