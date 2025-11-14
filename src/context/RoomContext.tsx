"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Room, RoomInstance, initialRooms, initialRoomInstances, RoomStatus } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { formatISO, startOfDay } from 'date-fns';

type RoomContextType = {
  rooms: Room[];
  roomInstances: RoomInstance[];
  addRoom: (roomData: Omit<Room, 'id' | 'rating' | 'distance' | 'ownerId'>) => void;
  updateRoom: (updatedRoom: Room) => void;
  deleteRoom: (roomId: string) => void;
  updateRoomInstance: (updatedInstance: RoomInstance) => void;
  getRoomById: (roomId: string) => Room | undefined;
  status: 'loading' | 'success' | 'error';
  error: string | null;
  getRoomStatusForDate: (instanceId: string, date: Date) => RoomStatus;
  setRoomStatusForDate: (instanceId: string, date: Date, status: RoomStatus) => void;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomInstances, setRoomInstances] = useState<RoomInstance[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
        try {
            const savedRooms = localStorage.getItem('rooms');
            const savedInstances = localStorage.getItem('roomInstances');
            
            if (savedRooms && savedInstances) {
                setRooms(JSON.parse(savedRooms));
                setRoomInstances(JSON.parse(savedInstances));
            } else {
                setRooms(initialRooms);
                setRoomInstances(initialRoomInstances);
            }
            setStatus('success');
        } catch (e) {
            console.error("Failed to load data from localStorage", e);
            setRooms(initialRooms);
            setRoomInstances(initialRoomInstances);
            setStatus('success');
        }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === 'success') {
        try {
            localStorage.setItem('rooms', JSON.stringify(rooms));
            localStorage.setItem('roomInstances', JSON.stringify(roomInstances));
        } catch (e) {
            console.error("Failed to save data to localStorage", e);
        }
    }
  }, [rooms, roomInstances, status]);

  const addRoom = (roomData: Omit<Room, 'id' | 'rating' | 'distance'>) => {
    const newRoomType: Room = {
      ...roomData,
      id: `room-type-${Date.now()}`,
      rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
      distance: +(Math.random() * 10 + 0.5).toFixed(1),
    };
    
    const newInstances: RoomInstance[] = Array.from({ length: newRoomType.totalQuantity }).map((_, i) => ({
      instanceId: `${newRoomType.id}-instance-${i + 1}`,
      roomTypeId: newRoomType.id,
      roomNumber: `...`, // Placeholder, user will edit
      status: 'available',
      ownerId: newRoomType.ownerId,
      overrides: {},
    }));
    
    setRooms(prev => [newRoomType, ...prev]);
    setRoomInstances(prev => [...prev, ...newInstances]);

     toast({
        title: "Өрөөний төрөл нэмэгдлээ!",
        description: `${newRoomType.roomName} төрлийн ${newRoomType.totalQuantity} ширхэг өрөө үүслээ. Одоо өрөө тус бүрийн дугаарыг онооно уу.`,
    });
  };

  const updateRoom = (updatedRoom: Room) => {
    setRooms(prevRooms => prevRooms.map(room => room.id === updatedRoom.id ? updatedRoom : room));
  };
  
  const updateRoomInstance = (updatedInstance: RoomInstance) => {
    setRoomInstances(prev => prev.map(instance => instance.instanceId === updatedInstance.instanceId ? updatedInstance : instance));
  };

  const deleteRoom = (roomTypeId: string) => {
    setRooms(prev => prev.filter(room => room.id !== roomTypeId));
    setRoomInstances(prev => prev.filter(instance => instance.roomTypeId !== roomTypeId));
    toast({
        title: "Өрөөний төрөл устгагдлаа",
        description: "Таны сонгосон өрөөний төрөл болон хамаарах бүх өрөөнүүд амжилттай устгагдлаа.",
        variant: "destructive",
    });
  };

  const getRoomById = useCallback((roomId: string) => {
    return rooms.find(r => r.id === roomId);
  }, [rooms]);

  const getRoomStatusForDate = useCallback((instanceId: string, date: Date): RoomStatus => {
    const instance = roomInstances.find(i => i.instanceId === instanceId);
    if (!instance) return 'closed'; // Should not happen

    const dateKey = formatISO(startOfDay(date), { representation: 'date' });
    const todayKey = formatISO(startOfDay(new Date()), { representation: 'date' });
    
    // Check for a specific override for the given date
    if (instance.overrides && instance.overrides[dateKey]) {
      return instance.overrides[dateKey].status;
    }
    
    // If it's today, return the base status
    if (dateKey === todayKey) {
        return instance.status;
    }

    // For future dates without overrides, assume 'available' unless the base status is 'closed'
    return instance.status === 'closed' ? 'closed' : 'available';

  }, [roomInstances]);

  const setRoomStatusForDate = useCallback((instanceId: string, date: Date, status: RoomStatus) => {
    const dateKey = formatISO(startOfDay(date), { representation: 'date' });
    const todayKey = formatISO(startOfDay(new Date()), { representation: 'date' });

    setRoomInstances(prev =>
      prev.map(instance => {
        if (instance.instanceId === instanceId) {
          const newInstance = { ...instance };
          
          // If the date is today, modify the base status
          if (dateKey === todayKey) {
            newInstance.status = status;
          } else {
            // For other dates, use overrides
            if (!newInstance.overrides) {
              newInstance.overrides = {};
            }
            // If setting to the default status, remove the override
            const defaultStatus = newInstance.status === 'closed' ? 'closed' : 'available';
            if (status === defaultStatus) {
                delete newInstance.overrides[dateKey];
            } else {
                newInstance.overrides[dateKey] = { status };
            }
          }
          return newInstance;
        }
        return instance;
      })
    );
  }, []);

  return (
    <RoomContext.Provider value={{ rooms, roomInstances, addRoom, updateRoom, deleteRoom, status, error, getRoomById, updateRoomInstance, getRoomStatusForDate, setRoomStatusForDate }}>
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
