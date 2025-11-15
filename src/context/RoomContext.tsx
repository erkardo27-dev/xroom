
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Room, RoomInstance, initialRooms, initialRoomInstances, RoomStatus } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay } from 'date-fns';

const LIKED_ROOMS_STORAGE_KEY = 'likedRooms';

type RoomContextType = {
  rooms: Room[];
  roomInstances: RoomInstance[];
  addRoom: (roomData: Omit<Room, 'id' | 'rating' | 'distance' | 'likes'>) => void;
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
  toggleLike: (roomId: string) => void;
  likedRooms: string[];
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomInstances, setRoomInstances] = useState<RoomInstance[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [toastInfo, setToastInfo] = useState<{ title: string, description: string } | null>(null);
  const [likedRooms, setLikedRooms] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
        try {
            const savedRooms = localStorage.getItem('rooms');
            const savedInstances = localStorage.getItem('roomInstances');
            const savedLikedRooms = localStorage.getItem(LIKED_ROOMS_STORAGE_KEY);
            
            if (savedRooms && savedInstances) {
                setRooms(JSON.parse(savedRooms));
                setRoomInstances(JSON.parse(savedInstances).map((inst: RoomInstance) => ({ ...inst, overrides: inst.overrides || {} }))); // Ensure overrides is not undefined
            } else {
                setRooms(initialRooms);
                setRoomInstances(initialRoomInstances);
            }
             if (savedLikedRooms) {
                setLikedRooms(JSON.parse(savedLikedRooms));
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
            localStorage.setItem(LIKED_ROOMS_STORAGE_KEY, JSON.stringify(likedRooms));
        } catch (e) {
            console.error("Failed to save data to localStorage", e);
        }
    }
  }, [rooms, roomInstances, likedRooms, status]);

  useEffect(() => {
    if (toastInfo) {
      toast(toastInfo);
      setToastInfo(null);
    }
  }, [toastInfo, toast]);

    const toggleLike = (roomId: string) => {
        const isLiked = likedRooms.includes(roomId);
        const newLikedRooms = isLiked 
            ? likedRooms.filter(id => id !== roomId)
            : [...likedRooms, roomId];
        
        setLikedRooms(newLikedRooms);
        
        setRooms(prevRooms => prevRooms.map(room => {
            if (room.id === roomId) {
                return { ...room, likes: isLiked ? (room.likes || 0) - 1 : (room.likes || 0) + 1 };
            }
            return room;
        }));
    };

  const addRoom = (roomData: Omit<Room, 'id' | 'rating' | 'distance' | 'likes'>) => {
    const newRoomType: Room = {
      ...roomData,
      id: `room-type-${Date.now()}`,
      rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
      distance: +(Math.random() * 10 + 0.5).toFixed(1),
      likes: 0,
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
    
    if (instance.overrides && instance.overrides[dateKey] && instance.overrides[dateKey].status) {
      return instance.overrides[dateKey].status;
    }
    
    const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;
    if (isToday) {
        return instance.status;
    }
    
    // If no override, and not today, it defaults to the instance's base status unless that is also a temporary state.
    // Let's assume non-overridden future dates are available.
    return 'available';

  }, [roomInstances]);

    const getRoomPriceForDate = useCallback((instanceId: string, date: Date): number => {
        const instance = roomInstances.find(i => i.instanceId === instanceId);
        if (!instance) return 0;
        const room = rooms.find(r => r.id === instance.roomTypeId);
        if (!room) return 0;

        const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
        const price = instance.overrides?.[dateKey]?.price ?? room.price;
        return price;
    }, [roomInstances, rooms]);

  const setRoomStatusForDate = useCallback((instanceId: string, date: Date, status: RoomStatus, bookingCode?: string) => {
    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
    const todayKey = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const isToday = dateKey === todayKey;

    setRoomInstances(prev =>
      prev.map(instance => {
        if (instance.instanceId === instanceId) {
          const newInstance = { ...instance, overrides: {...instance.overrides} };

          if (isToday) {
            newInstance.status = status;
            if(status === 'booked' && bookingCode) {
                 newInstance.bookingCode = bookingCode;
            } else if (status === 'available') {
                 delete newInstance.bookingCode;
            }
          } 
          
          // Always create or update the override for any date change
          if (!newInstance.overrides[dateKey]) {
            newInstance.overrides[dateKey] = {};
          }
          newInstance.overrides[dateKey].status = status;

          if(status === 'booked' && bookingCode) {
              newInstance.overrides[dateKey].bookingCode = bookingCode;
          } else if (newInstance.overrides[dateKey]) {
              delete newInstance.overrides[dateKey].bookingCode;
          }

          // Cleanup override if it just contains the default status
          const isDefaultStatus = status === 'available'; 
          const hasNoOtherOverrides = newInstance.overrides[dateKey]?.price === undefined;
          if (isDefaultStatus && hasNoOtherOverrides && !isToday) { // don't clean up today's override if it's just 'available' as it might be an intentional change from 'booked'
                delete newInstance.overrides[dateKey];
          }

          return newInstance;
        }
        return instance;
      })
    );
  }, []);

  const setRoomPriceForDate = useCallback((instanceId: string, date: Date, price: number) => {
     const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
      setRoomInstances(prev =>
        prev.map(instance => {
            if (instance.instanceId === instanceId) {
                const roomType = getRoomById(instance.roomTypeId);
                if (!roomType) return instance;

                const newInstance = { ...instance, overrides: { ...instance.overrides } };
                
                if (!newInstance.overrides[dateKey]) {
                    newInstance.overrides[dateKey] = {};
                }

                if (price === roomType.price) {
                    delete newInstance.overrides[dateKey].price;
                    if (Object.keys(newInstance.overrides[dateKey]).length === 0) {
                        delete newInstance.overrides[dateKey];
                    }
                } else {
                    newInstance.overrides[dateKey].price = price;
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
  }, [getRoomById]);

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

                if (!updatedInstance.overrides[dateKey]) {
                    updatedInstance.overrides[dateKey] = {};
                }
                
                if (price === undefined || price === roomType.price) {
                    delete updatedInstance.overrides[dateKey].price;
                } else {
                    updatedInstance.overrides[dateKey].price = price;
                }

                if (Object.keys(updatedInstance.overrides[dateKey]).length === 0) {
                    delete updatedInstance.overrides[dateKey];
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

  }, [getRoomById, roomInstances]);


  return (
    <RoomContext.Provider value={{ rooms, roomInstances, addRoom, updateRoom, deleteRoomInstance, status, error, getRoomById, updateRoomInstance, getRoomStatusForDate, setRoomStatusForDate, getRoomPriceForDate, setRoomPriceForDate, getPriceForRoomTypeOnDate, setPriceForRoomTypeOnDate, toggleLike, likedRooms }}>
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
