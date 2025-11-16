"use client";

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import RoomList from '@/components/rooms/RoomList';
import { RoomProvider, useRoom } from '@/context/RoomContext';
import { useMemo } from 'react';

function HomePageContent() {
  const { availableRoomsByType } = useRoom();

  const hotDeals = useMemo(() => {
    return availableRoomsByType
      .filter(room => room.originalPrice && room.originalPrice > room.price)
      .map(room => ({
          ...room,
          discount: Math.round(((room.originalPrice! - room.price) / room.originalPrice!) * 100)
      }))
      .sort((a, b) => b.discount - a.discount);
  }, [availableRoomsByType]);
  
  return (
    <div className="flex flex-col min-h-screen bg-muted/30 text-foreground">
      <Header />
      <main className="flex-1">
        <RoomList hotDeals={hotDeals} />
      </main>
      <Footer />
    </div>
  );
}


export default function Home() {
  return (
    <RoomProvider>
      <HomePageContent />
    </RoomProvider>
  );
}
