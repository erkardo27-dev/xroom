"use client";

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import RoomList from '@/components/rooms/RoomList';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <RoomList />
      </main>
      <Footer />
    </div>
  );
}
