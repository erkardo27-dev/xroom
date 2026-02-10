
"use client";

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import RoomList from '@/components/rooms/RoomList';
import { RoomProvider } from '@/context/RoomContext';
import { Suspense } from 'react';

export default function Home() {
  return (
    <RoomProvider>
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground selection:bg-primary/20">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<div className="container mx-auto py-12 px-4 md:px-8 text-center">Уншиж байна...</div>}>
            <RoomList />
          </Suspense>
        </main>
        <Footer />
      </div>
    </RoomProvider>
  );
}
