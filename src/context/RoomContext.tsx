"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Room, RoomInstance, initialRooms, initialRoomInstances, RoomStatus } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay } from 'date-fns';

type RoomContextType = {
  rooms: Room[];
  roomInstances: RoomInstance[];
  addRoom: (roomData: Omit<Room, 'id' | 'rating' | 'distance'>) => void;
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
  getPriceForRoomTypeOnDate: (roomTypeId: string, date: Date) => number;
  setPriceForRoomTypeOnDate: (roomTypeId: string, date: Date, price: number | undefined) => void;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomInstances, setRoomInstances] = useState<RoomInstance[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [toastInfo, setToastInfo] = useState<{ title: string, description: string } | null>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    if (toastInfo) {
      toast(toastInfo);
      setToastInfo(null);
    }
  }, [toastInfo, toast]);

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

    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
    const todayKey = format(startOfDay(new Date()), 'yyyy-MM-dd');
    
    if (instance.overrides && instance.overrides[dateKey]) {
      return instance.overrides[dateKey].status;
    }
    
    if (dateKey === todayKey) {
        return instance.status;
    }
    
    // For future or past dates without specific overrides, derive from base status.
    // If base is 'closed' or 'maintenance', it affects all dates unless overridden.
    return (instance.status === 'closed' || instance.status === 'maintenance') && dateKey > todayKey ? 'closed' : 'available';

  }, [roomInstances]);

    const getRoomPriceForDate = useCallback((instanceId: string, date: Date): number => {
        const instance = roomInstances.find(i => i.instanceId === instanceId);
        if (!instance) return 0;
        const room = rooms.find(r => r.id === instance.roomTypeId);
        if (!room) return 0;

        const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
        // Check for a date-specific price override first
        const price = instance.overrides?.[dateKey]?.price ?? room.price;
        return price;
    }, [roomInstances, rooms]);

  const setRoomStatusForDate = useCallback((instanceId: string, date: Date, status: RoomStatus, bookingCode?: string) => {
    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
    const todayKey = format(startOfDay(new Date()), 'yyyy-MM-dd');

    setRoomInstances(prev =>
      prev.map(instance => {
        if (instance.instanceId === instanceId) {
          const newInstance = { ...instance, overrides: {...instance.overrides} };
          const isToday = dateKey === todayKey;

          if (isToday) {
            // If it's for today, update the base status
            newInstance.status = status;
            if(status === 'booked' && bookingCode) {
                 newInstance.bookingCode = bookingCode;
            } else {
                 delete newInstance.bookingCode;
            }
            // Also clean up today's override if it becomes redundant
            if (newInstance.overrides[dateKey]) {
                const roomType = getRoomById(instance.roomTypeId);
                const isPriceOverridden = newInstance.overrides[dateKey].price !== undefined && newInstance.overrides[dateKey].price !== roomType?.price;
                if (!isPriceOverridden) {
                    delete newInstance.overrides[dateKey];
                } else {
                    delete newInstance.overrides[dateKey].status;
                    delete newInstance.overrides[dateKey].bookingCode;
                }
            }
          } else {
             // For future or past dates, use overrides
             const defaultStatusForFuture = (instance.status === 'closed' || instance.status === 'maintenance') && dateKey > todayKey ? 'closed' : 'available';

             if (!newInstance.overrides[dateKey]) {
                newInstance.overrides[dateKey] = { status: defaultStatusForFuture };
             }

            if (status === defaultStatusForFuture && newInstance.overrides[dateKey]?.price === undefined) {
                delete newInstance.overrides[dateKey];
            } else {
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
     const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
      setRoomInstances(prev =>
        prev.map(instance => {
            if (instance.instanceId === instanceId) {
                const roomType = getRoomById(instance.roomTypeId);
                if (!roomType) return instance;

                const newInstance = { ...instance, overrides: { ...instance.overrides } };
                const currentStatus = getRoomStatusForDate(instanceId, date);
                
                if (price === roomType.price) {
                    if (newInstance.overrides[dateKey]) {
                        delete newInstance.overrides[dateKey].price;
                        const defaultStatus = (instance.status === 'closed' || instance.status === 'maintenance') && dateKey > format(new Date(), 'yyyy-MM-dd') ? 'closed' : 'available';
                        if (newInstance.overrides[dateKey].status === defaultStatus) {
                            delete newInstance.overrides[dateKey];
                        }
                    }
                } else {
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

  const getPriceForRoomTypeOnDate = useCallback((roomTypeId: string, date: Date): number => {
    const roomType = rooms.find(r => r.id === roomTypeId);
    if (!roomType) return 0;
    
    const anyInstance = roomInstances.find(i => i.roomTypeId === roomTypeId);
    if (!anyInstance) return roomType.price;

    return getRoomPriceForDate(anyInstance.instanceId, date);
  }, [rooms, roomInstances, getRoomPriceForDate]);


  const setPriceForRoomTypeOnDate = useCallback((roomTypeId: string, date: Date, price: number | undefined) => {
    const roomType = getRoomById(roomTypeId);
    if (!roomType) return;
    
    const finalPrice = price === undefined ? roomType.price : price;

    const instancesToUpdate = roomInstances.filter(i => i.roomTypeId === roomTypeId);
    
    setRoomInstances(prev => {
        const newInstances = [...prev];
        instancesToUpdate.forEach(inst => {
            const index = newInstances.findIndex(i => i.instanceId === inst.instanceId);
            if (index !== -1) {
                const updatedInstance = { ...newInstances[index], overrides: { ...newInstances[index].overrides } };
                const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
                const currentStatus = getRoomStatusForDate(inst.instanceId, date);

                if (price === undefined || price === roomType.price) {
                    if (updatedInstance.overrides[dateKey]) {
                        delete updatedInstance.overrides[dateKey].price;
                        if (Object.keys(updatedInstance.overrides[dateKey]).length === 1 && updatedInstance.overrides[dateKey].status === ((inst.status === 'closed' || inst.status === 'maintenance') && dateKey > format(new Date(), 'yyyy-MM-dd') ? 'closed' : 'available')) {
                           delete updatedInstance.overrides[dateKey];
                        }
                    }
                } else {
                    if (!updatedInstance.overrides[dateKey]) {
                        updatedInstance.overrides[dateKey] = { status: currentStatus };
                    }
                    updatedInstance.overrides[dateKey].price = price;
                }
                newInstances[index] = updatedInstance;
            }
        });
        return newInstances;
    });

    setToastInfo({
        title: "Үнэ шинэчлэгдлээ",
        description: `${format(date, 'M/d')}-ний ${roomType.roomName} өрөөнүүдийн үнэ ${finalPrice.toLocaleString()}₮ боллоо.`
    });

  }, [getRoomById, roomInstances, getRoomStatusForDate]);


  return (
    <RoomContext.Provider value={{ rooms, roomInstances, addRoom, updateRoom, deleteRoomInstance, status, error, getRoomById, updateRoomInstance, getRoomStatusForDate, setRoomStatusForDate, getRoomPriceForDate, setRoomPriceForDate, getPriceForRoomTypeOnDate, setPriceForRoomTypeOnDate }}>
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
