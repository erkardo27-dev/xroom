"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Room, rooms as initialRooms, NewRoom } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

type RoomContextType = {
  rooms: Room[];
  addRoom: (room: NewRoom) => void;
  updateRoom: (updatedRoom: Room) => void;
  deleteRoom: (roomId: string) => void;
  status: 'loading' | 'success' | 'error';
  error: string | null;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load initial rooms from data.ts
    // In a real app, this would be an API call
    const timer = setTimeout(() => {
        try {
            const savedRooms = localStorage.getItem('rooms');
            if (savedRooms) {
                setRooms(JSON.parse(savedRooms));
            } else {
                setRooms(initialRooms);
            }
            setStatus('success');
        } catch (e) {
            console.error("Failed to load rooms from localStorage", e);
            setRooms(initialRooms); // Fallback to initial data
            setStatus('success');
        }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Save rooms to localStorage whenever they change
    if (status === 'success') {
        try {
            localStorage.setItem('rooms', JSON.stringify(rooms));
        } catch (e) {
            console.error("Failed to save rooms to localStorage", e);
        }
    }
  }, [rooms, status]);

  const addRoom = (roomData: NewRoom) => {
    const newRoom: Room = {
      ...roomData,
      id: `room-${Date.now()}`,
      rating: +(Math.random() * 1.5 + 3.5).toFixed(1), // 3.5 to 5.0
      distance: +(Math.random() * 10 + 0.5).toFixed(1), // 0.5 to 10.5 km
      availableQuantity: roomData.totalQuantity,
    };
    setRooms((prevRooms) => [newRoom, ...prevRooms]);
  };

  const updateRoom = (updatedRoom: Room) => {
    setRooms(prevRooms => prevRooms.map(room => room.id === updatedRoom.id ? updatedRoom : room));
  };

  const deleteRoom = (roomId: string) => {
    setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
    toast({
        title: "Өрөө устгагдлаа",
        description: "Таны сонгосон өрөө амжилттай устгагдлаа.",
    });
  };

  return (
    <RoomContext.Provider value={{ rooms, addRoom, updateRoom, deleteRoom, status, error }}>
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
