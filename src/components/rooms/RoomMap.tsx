"use client";

import { useState } from 'react';
import type { Room } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';

// Mock coordinates for demonstration purposes
const roomsWithCoords = (rooms: Room[]) =>
  rooms.map((room, index) => ({
    ...room,
    coords: {
      x: Math.random() * 85 + 5, // % position for x
      y: Math.random() * 80 + 10, // % position for y
    },
  }));

export function RoomMap({ rooms }: { rooms: Room[] }) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const mappedRooms = roomsWithCoords(rooms);

  const handleMarkerClick = (room: Room) => {
    setSelectedRoom(room);
  };

  const closePopup = () => {
    setSelectedRoom(null);
  };
  
  const image = selectedRoom ? PlaceHolderImages.find(img => img.id === selectedRoom.imageIds[0]) : null;

  return (
    <div className="relative w-full h-[600px] bg-muted rounded-lg overflow-hidden border">
      <Image
        src="https://images.unsplash.com/photo-1599567437813-75b2713636e2?q=80&w=2070&auto=format&fit=crop"
        alt="Хотын газрын зураг"
        fill
        className="object-cover opacity-30"
      />
      {mappedRooms.map(room => (
        <button
          key={room.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-bold shadow-lg hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          style={{ left: `${room.coords.x}%`, top: `${room.coords.y}%` }}
          onClick={() => handleMarkerClick(room)}
          aria-label={`View ${room.roomName}`}
        >
         {(room.price / 1000).toFixed(0)}k
        </button>
      ))}

      {selectedRoom && image && (
        <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm shadow-2xl z-20 animate-in slide-in-from-bottom-10">
            <CardContent className="p-0">
                <div className="flex">
                    <Image 
                        src={image.imageUrl}
                        alt={selectedRoom.roomName}
                        width={120}
                        height={120}
                        className="object-cover w-24 h-auto"
                    />
                    <div className="p-3 flex flex-col">
                        <h4 className="font-bold leading-tight">{selectedRoom.roomName}</h4>
                        <p className="text-sm text-muted-foreground">{selectedRoom.hotelName}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1 gap-2">
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold">{selectedRoom.rating.toFixed(1)}</span>
                            </div>
                            <span>{selectedRoom.distance}км зайтай</span>
                        </div>
                        <div className="flex-grow"/>
                        <div className="flex items-end gap-4 mt-2">
                             <p className="text-xl font-bold text-foreground">{selectedRoom.price.toLocaleString()}₮</p>
                             <Button size="sm" className="bg-primary hover:bg-primary/90">Захиалах</Button>
                        </div>
                    </div>
                </div>
            </CardContent>
             <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 z-30 bg-background/50" onClick={closePopup}>
                <X className="w-4 h-4" />
                <span className="sr-only">Хаах</span>
            </Button>
        </Card>
      )}
    </div>
  );
}
