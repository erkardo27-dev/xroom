

"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { Room, RoomInstance, RoomStatus } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useAuth } from "./AuthContext";

const LIKED_ROOMS_STORAGE_KEY = 'likedRooms';

type RoomContextType = {
  rooms: Room[];
  roomInstances: RoomInstance[];
  availableRoomsByType: (Room & { availableInstances: RoomInstance[] })[];
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
  setPriceForRoomTypeOnDate: (roomTypeId: string, date: Date, price: number | undefined) => void;
  getPriceForRoomTypeOnDate: (roomTypeId: string, date: Date) => number;
  setRoomPriceForDate: (instanceId: string, date: Date, price: number) => void;
  toggleLike: (roomId: string) => void;
  likedRooms: string[];
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user } = useAuth();

  const roomsQuery = useMemoFirebase(() => collection(firestore, 'room_types'), [firestore]);
  const { data: rooms = [], isLoading: isRoomsLoading, error: roomsError } = useCollection<Room>(roomsQuery);
  
  const instancesQuery = useMemoFirebase(() => collection(firestore, 'room_instances'), [firestore]);
  const { data: roomInstances = [], isLoading: isInstancesLoading, error: instancesError } = useCollection<RoomInstance>(instancesQuery);

  const [likedRooms, setLikedRooms] = useState<string[]>([]);
  const { toast } = useToast();

  const status = isRoomsLoading || isInstancesLoading ? 'loading' : (roomsError || instancesError) ? 'error' : 'success';
  const error = roomsError?.message || instancesError?.message || null;


  useEffect(() => {
     try {
        const savedLikedRooms = localStorage.getItem(LIKED_ROOMS_STORAGE_KEY);
         if (savedLikedRooms) {
            setLikedRooms(JSON.parse(savedLikedRooms));
        }
    } catch (e) {
        console.error("Failed to load liked rooms from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem(LIKED_ROOMS_STORAGE_KEY, JSON.stringify(likedRooms));
    } catch (e) {
        console.error("Failed to save liked rooms to localStorage", e);
    }
  }, [likedRooms]);


    const toggleLike = (roomId: string) => {
        const isLiked = likedRooms.includes(roomId);
        const newLikedRooms = isLiked 
            ? likedRooms.filter(id => id !== roomId)
            : [...likedRooms, roomId];
        
        setLikedRooms(newLikedRooms);
        
        const roomRef = doc(firestore, "room_types", roomId);
        const room = rooms.find(r => r.id === roomId);
        if (room) {
            const newLikes = isLiked ? (room.likes || 0) - 1 : (room.likes || 0) + 1;
            setDocumentNonBlocking(roomRef, { likes: newLikes }, { merge: true });
        }
    };

  const addRoom = async (roomData: Omit<Room, 'id' | 'rating' | 'distance' | 'likes'>) => {
    if (!firestore || !user) return;

    const roomTypeId = doc(collection(firestore, 'room_types')).id;
    const newRoomTypeRef = doc(firestore, "room_types", roomTypeId);

    const newRoomType: Room = {
      ...roomData,
      id: roomTypeId,
      rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
      distance: +(Math.random() * 10 + 0.5).toFixed(1),
      likes: 0,
      ownerId: user.uid,
    };
    
    const batch = writeBatch(firestore);
    batch.set(newRoomTypeRef, newRoomType);

    const newInstances: RoomInstance[] = Array.from({ length: newRoomType.totalQuantity }).map((_, i) => {
        const instanceId = doc(collection(firestore, 'room_instances')).id;
        const newInstanceRef = doc(firestore, "room_instances", instanceId);
        const instanceData: RoomInstance = {
            instanceId: instanceId,
            roomTypeId: newRoomType.id,
            roomNumber: `...`,
            status: 'available',
            ownerId: newRoomType.ownerId,
            overrides: {},
        };
        batch.set(newInstanceRef, instanceData);
        return instanceData;
    });

    try {
        await batch.commit();
        toast({
            title: "Өрөөний төрөл нэмэгдлээ!",
            description: `${newRoomType.roomName} төрлийн ${newRoomType.totalQuantity} ширхэг өрөө үүслээ. Одоо өрөө тус бүрийн дугаарыг онооно уу.`,
        });
    } catch (e: any) {
        toast({
            variant: "destructive",
            title: "Алдаа",
            description: "Өрөө нэмэхэд алдаа гарлаа: " + e.message,
        });
    }
  };

  const updateRoom = (updatedRoom: Room) => {
    const roomRef = doc(firestore, "room_types", updatedRoom.id);
    setDocumentNonBlocking(roomRef, updatedRoom, { merge: true });
  };
  
  const updateRoomInstance = (updatedInstance: RoomInstance) => {
    const instanceRef = doc(firestore, "room_instances", updatedInstance.instanceId);
    setDocumentNonBlocking(instanceRef, updatedInstance, { merge: true });
  };

  const deleteRoomInstance = (instanceId: string) => {
    const instanceRef = doc(firestore, "room_instances", instanceId);
    deleteDocumentNonBlocking(instanceRef);

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
    
    return instance.status === 'booked' || instance.status === 'occupied' ? 'available' : instance.status;

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

    const instance = roomInstances.find(i => i.instanceId === instanceId);
    if (!instance) return;

    const newInstance = { ...instance, overrides: {...instance.overrides} };

    if (!newInstance.overrides[dateKey]) {
        newInstance.overrides[dateKey] = {};
    }
    
    newInstance.overrides[dateKey].status = status;
    if (bookingCode) {
        newInstance.overrides[dateKey].bookingCode = bookingCode;
    }

    if (isToday) {
        newInstance.status = status;
        if (bookingCode) {
            newInstance.bookingCode = bookingCode;
        } else if (status === 'available') {
            delete newInstance.bookingCode;
        }
    }
    
    const instanceRef = doc(firestore, "room_instances", instanceId);
    setDocumentNonBlocking(instanceRef, newInstance, { merge: true });

  }, [roomInstances, firestore]);

  const setRoomPriceForDate = useCallback((instanceId: string, date: Date, price: number) => {
     const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
      const instance = roomInstances.find(i => i.instanceId === instanceId);
      if(!instance) return;

      const room = rooms.find(r => r.id === instance.roomTypeId);
      if(!room) return;
      
      const newInstance = { ...instance, overrides: { ...instance.overrides } };
      
      if (!newInstance.overrides[dateKey]) {
          newInstance.overrides[dateKey] = {};
      }

      if (price === room.price) {
          delete newInstance.overrides[dateKey].price;
          if (Object.keys(newInstance.overrides[dateKey]).length === 0) {
              delete newInstance.overrides[dateKey];
          }
      } else {
          newInstance.overrides[dateKey].price = price;
      }

      const instanceRef = doc(firestore, "room_instances", instanceId);
      setDocumentNonBlocking(instanceRef, newInstance, { merge: true });
      
      toast({
        title: "Үнэ шинэчлэгдлээ",
        description: `${format(date, 'M/d')}-ний ${room.roomName} (${instance.roomNumber}) өрөөний үнэ ${price.toLocaleString()}₮ боллоо.`
      });

  }, [roomInstances, rooms, firestore, toast]);

  const getPriceForRoomTypeOnDate = useCallback((roomTypeId: string, date: Date): number => {
    const roomType = rooms.find(r => r.id === roomTypeId);
    if (!roomType) return 0;
    
    const anyInstance = roomInstances.find(i => i.roomTypeId === roomTypeId);
    if (!anyInstance) return roomType.price;

    return getRoomPriceForDate(anyInstance.instanceId, date);
  }, [rooms, roomInstances, getRoomPriceForDate]);


  const setPriceForRoomTypeOnDate = useCallback((roomTypeId: string, date: Date, price: number | undefined) => {
    const roomType = getRoomById(roomTypeId);
    if (!roomType || !firestore) return;
    
    const finalPrice = price === undefined ? roomType.price : price;
    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');

    const instancesToUpdate = roomInstances.filter(i => i.roomTypeId === roomTypeId);
    const batch = writeBatch(firestore);

    instancesToUpdate.forEach(inst => {
        const instanceRef = doc(firestore, "room_instances", inst.instanceId);
        const newOverrides = { ...inst.overrides };
        
        if (!newOverrides[dateKey]) {
            newOverrides[dateKey] = {};
        }

        if (price === undefined || price === roomType.price) {
            delete newOverrides[dateKey].price;
            if(Object.keys(newOverrides[dateKey]).length === 0) {
                 delete newOverrides[dateKey];
            }
        } else {
            newOverrides[dateKey].price = price;
        }
        batch.update(instanceRef, { overrides: newOverrides });
    });
    
    batch.commit().then(() => {
        toast({
            title: "Үнэ шинэчлэгдлээ",
            description: `${format(date, 'M/d')}-ний ${roomType.roomName} өрөөнүүдийн үнэ ${finalPrice.toLocaleString()}₮ боллоо.`
        });
    }).catch((e) => {
         toast({
            variant: "destructive",
            title: "Алдаа",
            description: "Үнийг шинэчлэхэд алдаа гарлаа: " + e.message,
        });
    });


  }, [getRoomById, roomInstances, toast, firestore]);

  const availableRoomsByType = useMemo(() => {
    if (!rooms) return [];
    const today = startOfDay(new Date());

    return rooms.map(roomType => {
      const availableInstances = roomInstances.filter(instance => 
        instance.roomTypeId === roomType.id && 
        getRoomStatusForDate(instance.instanceId, today) === 'available'
      );
      return {
        ...roomType,
        availableInstances,
      };
    }).filter(room => room.availableInstances.length > 0);

  }, [rooms, roomInstances, getRoomStatusForDate]);


  return (
    <RoomContext.Provider value={{ rooms, roomInstances, availableRoomsByType, addRoom, updateRoom, deleteRoomInstance, status, error, getRoomById, updateRoomInstance, getRoomStatusForDate, setRoomStatusForDate, getRoomPriceForDate, setPriceForRoomTypeOnDate, getPriceForRoomTypeOnDate, setRoomPriceForDate, toggleLike, likedRooms }}>
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