"use client";

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import RoomList from '@/components/rooms/RoomList';
import { RoomProvider } from '@/context/RoomContext';

export default function Home() {
  return (
    <RoomProvider>
      <div className="flex flex-col min-h-screen bg-muted/30 text-foreground">
        <Header />
        <main className="flex-1">
          <RoomList />
        </main>
        <Footer />
      </div>
    </RoomProvider>
  );
}
