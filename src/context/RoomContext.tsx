"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Room, rooms as initialRooms } from "@/lib/data";

type RoomContextType = {
  rooms: Room[];
  addRoom: (room: Room) => void;
  status: 'loading' | 'success' | 'error';
  error: string | null;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setRooms(initialRooms);
              setStatus('success');
            },
            (err) => {
              setError(`Таны байршлыг олоход алдаа гарлаа: ${err.message}. Үндсэн үр дүнг харуулж байна.`);
              setRooms(initialRooms);
              setStatus('success'); 
            }
          );
        } else {
            setError("Таны хөтөч байршил тодорхойлохыг дэмжихгүй байна. Үндсэн үр дүнг харуулж байна.");
            setRooms(initialRooms);
            setStatus('success');
        }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const addRoom = (room: Room) => {
    setRooms((prevRooms) => [room, ...prevRooms]);
  };

  return (
    <RoomContext.Provider value={{ rooms, addRoom, status, error }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};
