
"use client";

import { useState, useMemo } from 'react';
import type { Room } from '@/lib/data';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';

const ULAANBAATAR_CENTER = { lat: 47.9188, lng: 106.9176 };

export function RoomMap({ rooms }: { rooms: Room[] }) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const roomsWithCoords = useMemo(() => 
      rooms.filter(room => room.latitude && room.longitude),
    [rooms]
  );
  
  const selectedRoom = useMemo(() => 
    roomsWithCoords.find(r => r.id === selectedRoomId),
    [roomsWithCoords, selectedRoomId]
  );

  return (
    <div className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] bg-secondary rounded-2xl overflow-hidden border-4 border-background shadow-inner">
       <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <Map
                mapId="XROOM_TONIGHT_HOMEPAGE_MAP"
                style={{ width: '100%', height: '100%' }}
                defaultCenter={ULAANBAATAR_CENTER}
                defaultZoom={12}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
            >
                {roomsWithCoords.map(room => (
                    <AdvancedMarker
                        key={room.id}
                        position={{ lat: room.latitude!, lng: room.longitude! }}
                        onClick={() => setSelectedRoomId(room.id)}
                    >
                         <Pin 
                            background={'hsl(var(--primary))'} 
                            borderColor={'hsl(var(--primary-foreground))'}
                            glyphColor={'hsl(var(--primary-foreground))'}
                        >
                            <span className='font-bold'>{(room.price / 1000).toFixed(0)}k</span>
                         </Pin>
                    </AdvancedMarker>
                ))}

                {selectedRoom && (
                    <InfoWindow 
                        position={{ lat: selectedRoom.latitude!, lng: selectedRoom.longitude! }}
                        onCloseClick={() => setSelectedRoomId(null)}
                        pixelOffset={[0,-40]}
                    >
                       <Card className="w-80 border-none shadow-none">
                            <CardContent className="p-0">
                                <div className="flex">
                                    <div className="relative w-28 flex-shrink-0">
                                       {selectedRoom.imageUrls[0] && <Image 
                                            src={selectedRoom.imageUrls[0]}
                                            alt={selectedRoom.roomName}
                                            width={112}
                                            height={150}
                                            className="object-cover rounded-l-lg h-full"
                                        />}
                                    </div>
                                    <div className="p-3 flex flex-col flex-1">
                                        <h4 className="font-bold leading-tight text-sm">{selectedRoom.roomName}</h4>
                                        <p className="text-xs text-muted-foreground">{selectedRoom.hotelName}</p>
                                        <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                <span className="font-semibold text-foreground/80">{selectedRoom.rating.toFixed(1)}</span>
                                            </div>
                                            <span>{selectedRoom.distance}км</span>
                                        </div>
                                        <div className="flex-grow"/>
                                        <div className="flex items-end justify-between gap-4 mt-2">
                                            <p className="text-lg font-bold text-primary">{selectedRoom.price.toLocaleString()}₮</p>
                                            <Button size="sm" className="font-semibold h-8">Захиалах</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </InfoWindow>
                )}

            </Map>
       </APIProvider>
    </div>
  );
}
