"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Room, RoomInstance, initialRooms, initialRoomInstances, RoomStatus } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay } from 'date-fns';

type RoomContextType = {
  rooms: Room[];
  roomInstances: RoomInstance[];
  addRoom: (roomData: Omit<Room, 'id' | 'rating' | 'distance' | 'ownerId'>) => void;
  updateRoom: (updatedRoom: Room) => void;
  deleteRoomInstance: (instanceId: string) => void;
  updateRoomInstance: (updatedInstance: RoomInstance) => void;
  getRoomById: (roomId: string) => Room | undefined;
  status: 'loading' | 'success' | 'error';
  error: string | null;
  getRoomStatusForDate: (instanceId: string, date: Date) => RoomStatus;
  setRoomStatusForDate: (instanceId: string, date: Date, status: RoomStatus, bookingCode?: string) => void;
  getRoomPriceForDate: (instanceId: string, date: Date) => number;
  setRoomPriceForDate: (instanceId: string, date: Date, price: number) => void;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomInstances, setRoomInstances] = useState<RoomInstance[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [toastInfo, setToastInfo] = useState<{ title: string; description: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (toastInfo) {
      toast(toastInfo);
      setToastInfo(null);
    }
  }, [toastInfo, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
        try {
            const savedRooms = localStorage.getItem('rooms');
            const savedInstances = localStorage.getItem('roomInstances');
            
            if (savedRooms && savedInstances) {
                setRooms(JSON.parse(savedRooms));
                setRoomInstances(JSON.parse(savedInstances).map((inst: RoomInstance) => ({ ...inst, overrides: inst.overrides || {} }))); // Ensure overrides is not undefined
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

  const deleteRoomInstance = (instanceId: string) => {
    const instanceToDelete = roomInstances.find(i => i.instanceId === instanceId);
    if (!instanceToDelete) return;

    const roomType = rooms.find(r => r.id === instanceToDelete.roomTypeId);
    
    setRoomInstances(prev => prev.filter(instance => instance.instanceId !== instanceId));
    
    // Also decrement totalQuantity on the room type
    if (roomType) {
        updateRoom({ ...roomType, totalQuantity: roomType.totalQuantity - 1 });
    }

    toast({
        title: "Өрөө устгагдлаа",
        description: "Сонгосон өрөө амжилттай устгагдлаа.",
        variant: "destructive",
    });
  };

  const getRoomById = useCallback((roomId: string) => {
    return rooms.find(r => r.id === roomId);
  }, [rooms]);

  const getRoomStatusForDate = useCallback((instanceId: string, date: Date): RoomStatus => {
    const instance = roomInstances.find(i => i.instanceId === instanceId);
    if (!instance) return 'closed'; 

    const dateKey = format(date, 'yyyy-MM-dd');
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    
    if (instance.overrides && instance.overrides[dateKey]) {
      return instance.overrides[dateKey].status;
    }
    
    if (dateKey === todayKey) {
        return instance.status;
    }
    
    // For future or past dates without specific overrides, derive from base status.
    // If base is 'closed' or 'maintenance', it affects all dates unless overridden.
    return instance.status === 'closed' || instance.status === 'maintenance' ? 'closed' : 'available';

  }, [roomInstances]);

    const getRoomPriceForDate = useCallback((instanceId: string, date: Date): number => {
        const instance = roomInstances.find(i => i.instanceId === instanceId);
        if (!instance) return 0;
        const room = rooms.find(r => r.id === instance.roomTypeId);
        if (!room) return 0;

        const dateKey = format(date, 'yyyy-MM-dd');
        // Check for a date-specific price override first
        const price = instance.overrides?.[dateKey]?.price ?? room.price;
        return price;
    }, [roomInstances, rooms]);

  const setRoomStatusForDate = useCallback((instanceId: string, date: Date, status: RoomStatus, bookingCode?: string) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const todayKey = format(new Date(), 'yyyy-MM-dd');

    setRoomInstances(prev =>
      prev.map(instance => {
        if (instance.instanceId === instanceId) {
          const newInstance = { ...instance, overrides: {...instance.overrides} };
          
          const isToday = dateKey === todayKey;

          if (isToday) {
            newInstance.status = status;
            if(status !== 'booked') {
                 delete newInstance.bookingCode;
            } else if (bookingCode) {
                 newInstance.bookingCode = bookingCode;
            }
          } else {
             const defaultStatusForFuture = instance.status === 'closed' || instance.status === 'maintenance' ? 'closed' : 'available';

             // Ensure the override for the date exists before modifying
             if (!newInstance.overrides[dateKey]) {
                const roomType = getRoomById(instance.roomTypeId);
                newInstance.overrides[dateKey] = { status: defaultStatusForFuture, price: roomType?.price };
             }

            if (status === defaultStatusForFuture && newInstance.overrides[dateKey]?.price === undefined) {
                // If status is default AND there is no price override, remove the whole override object for that date
                delete newInstance.overrides[dateKey];
            } else {
                // Otherwise, just update the status
                newInstance.overrides[dateKey].status = status;
                if(status === 'booked' && bookingCode) {
                    newInstance.overrides[dateKey].bookingCode = bookingCode;
                } else {
                    delete newInstance.overrides[dateKey].bookingCode;
                }
            }
          }
          return newInstance;
        }
        return instance;
      })
    );
  }, [getRoomById]);

  const setRoomPriceForDate = useCallback((instanceId: string, date: Date, price: number) => {
     const dateKey = format(date, 'yyyy-MM-dd');
      setRoomInstances(prev =>
        prev.map(instance => {
            if (instance.instanceId === instanceId) {
                const roomType = getRoomById(instance.roomTypeId);
                if (!roomType) return instance;

                const newInstance = { ...instance, overrides: { ...instance.overrides } };

                // Get the current status for the day, or the default if not set
                const currentStatus = getRoomStatusForDate(instanceId, date);
                
                // If the new price is the base price, we might be able to remove the price override
                if (price === roomType.price) {
                     // If an override exists for this date
                    if (newInstance.overrides[dateKey]) {
                        delete newInstance.overrides[dateKey].price;
                        // If the status is also default, remove the entire date override
                        const defaultStatus = instance.status === 'closed' || instance.status === 'maintenance' ? 'closed' : 'available';
                        if (newInstance.overrides[dateKey].status === defaultStatus) {
                            delete newInstance.overrides[dateKey];
                        }
                    }
                } else { // New price is different from base, so we need an override
                     if (!newInstance.overrides[dateKey]) {
                        newInstance.overrides[dateKey] = { status: currentStatus, price: price };
                    } else {
                        newInstance.overrides[dateKey].price = price;
                    }
                }
                setToastInfo({
                  title: "Үнэ шинэчлэгдлээ",
                  description: `${format(date, 'M/d')}-ний ${roomType.roomName} (${instance.roomNumber}) өрөөний үнэ ${price.toLocaleString()}₮ боллоо.`
                });
                return newInstance;
            }
            return instance;
        })
      );
  }, [getRoomById, getRoomStatusForDate]);

  return (
    <RoomContext.Provider value={{ rooms, roomInstances, addRoom, updateRoom, deleteRoomInstance, status, error, getRoomById, updateRoomInstance, getRoomStatusForDate, setRoomStatusForDate, getRoomPriceForDate, setRoomPriceForDate }}>
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
