
"use client";

import { useState, useMemo } from 'react';
import type { Room, RoomInstance } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';
import { useRoom } from '@/context/RoomContext';

// Create a memoized version of rooms with coordinates
const useRoomsWithCoords = (rooms: Room[]) => {
    return useMemo(() => 
      rooms.map((room) => ({
        ...room,
        coords: {
          x: Math.random() * 85 + 7.5, // % position for x (7.5 to 92.5)
          y: Math.random() * 80 + 10, // % position for y (10 to 90)
        },
      })),
    [rooms]);
};

export function RoomMap({ rooms }: { rooms: Room[] }) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const mappedRooms = useRoomsWithCoords(rooms);
  const { setRoomStatusForDate } = useRoom();

  const handleMarkerClick = (room: Room) => {
    setSelectedRoomId(room.id);
  };

  const closePopup = () => {
    setSelectedRoomId(null);
  };

  const selectedRoom = useMemo(() => 
    mappedRooms.find(r => r.id === selectedRoomId),
    [mappedRooms, selectedRoomId]
  );
  
  const image = selectedRoom ? PlaceHolderImages.find(img => img.id === selectedRoom.imageIds[0]) : null;
  const mapImage = PlaceHolderImages.find(img => img.id === 'ulaanbaatar-map');

  return (
    <div className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] bg-secondary rounded-2xl overflow-hidden border-4 border-background shadow-inner">
      {mapImage && <Image
        src={mapImage.imageUrl}
        alt={mapImage.description}
        fill
        className="object-cover opacity-30 saturate-50"
        data-ai-hint={mapImage.imageHint}
      />}
      {mappedRooms.map(room => (
        <button
          key={room.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-primary text-primary-foreground rounded-full px-2.5 py-1 text-xs font-bold shadow-lg hover:scale-110 hover:z-10 transition-transform focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          style={{ left: `${room.coords.x}%`, top: `${room.coords.y}%` }}
          onClick={() => handleMarkerClick(room)}
          aria-label={`View ${room.roomName}`}
        >
         {(room.price / 1000).toFixed(0)}k
        </button>
      ))}

      {selectedRoom && image && (
        <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-sm shadow-2xl z-20 animate-in slide-in-from-bottom-10 duration-300">
            <CardContent className="p-0">
                <div className="flex">
                    <div className="relative w-28 flex-shrink-0">
                        <Image 
                            src={image.imageUrl}
                            alt={selectedRoom.roomName}
                            fill
                            className="object-cover rounded-l-lg"
                        />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                        <h4 className="font-bold leading-tight">{selectedRoom.roomName}</h4>
                        <p className="text-sm text-muted-foreground">{selectedRoom.hotelName}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1 gap-2">
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold text-foreground/80">{selectedRoom.rating.toFixed(1)}</span>
                            </div>
                            <span>{selectedRoom.distance}км</span>
                        </div>
                        <div className="flex-grow"/>
                        <div className="flex items-end justify-between gap-4 mt-2">
                             <p className="text-xl font-bold text-primary">{selectedRoom.price.toLocaleString()}₮</p>
                             <Button size="sm" className="font-semibold">Захиалах</Button>
                        </div>
                    </div>
                </div>
            </CardContent>
             <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 z-30 bg-background/30 backdrop-blur-sm rounded-full" onClick={closePopup}>
                <X className="w-4 h-4" />
                <span className="sr-only">Хаах</span>
            </Button>
        </Card>
      )}
    </div>
  );
}
