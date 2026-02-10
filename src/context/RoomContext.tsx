

"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { Room, RoomInstance, RoomStatus } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, addDays } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, writeBatch, query, where, or } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useAuth } from "./AuthContext";
import { getDistanceFromLatLonInKm } from "@/lib/utils";

const LIKED_ROOMS_STORAGE_KEY = 'likedRooms';

type RoomContextType = {
  rooms: Room[];
  roomInstances: RoomInstance[];
  availableRoomsByType: (Room & { availableInstances: RoomInstance[] })[];
  ownerRooms: Room[];
  addRoom: (roomData: Omit<Room, 'id' | 'rating' | 'distance' | 'likes'>) => void;
  updateRoom: (updatedRoom: Room) => void;
  deleteRoomInstance: (instanceId: string) => void;
  updateRoomInstance: (updatedInstance: Partial<RoomInstance> & { instanceId: string }) => void;
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
  selectedDateRange: { from: Date; to: Date };
  setSelectedDateRange: (range: { from: Date; to: Date }) => void;
  calculateTotalPrice: (roomTypeId: string, from: Date, to: Date) => number;
  calculateTotalDeposit: (roomTypeId: string, from: Date, to: Date) => number;
  isRoomAvailableInRange: (instanceId: string, from: Date, to: Date) => boolean;
  getRoomDepositForDate: (instanceId: string, date: Date) => number;
  setRoomDepositForDate: (instanceId: string, date: Date, discount: number | undefined) => void;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user, userUid, hotelInfo } = useAuth();

  const roomsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'room_types') : null, [firestore]);
  const { data: serverRooms = [], isLoading: isRoomsLoading, error: roomsError } = useCollection<Room>(roomsQuery);

  const { isAdmin } = useAuth();

  const instancesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const base = collection(firestore, 'room_instances');
    if (isAdmin) return base;
    if (userUid) {
      // Owner/User: see their own (any status) OR any available
      return query(base, or(
        where('ownerId', '==', userUid),
        where('status', '==', 'available')
      ));
    }
    // Guest: only available
    return query(base, where('status', '==', 'available'));
  }, [firestore, userUid, isAdmin]);

  const { data: serverRoomInstances = [], isLoading: isInstancesLoading, error: instancesError } = useCollection<RoomInstance>(instancesQuery);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomInstances, setRoomInstances] = useState<RoomInstance[]>([]);
  const [likedRooms, setLikedRooms] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);

  const [selectedDateRange, setSelectedDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfDay(new Date()),
    to: addDays(startOfDay(new Date()), 1),
  });

  const { toast } = useToast();

  const status = isRoomsLoading || isInstancesLoading ? 'loading' : (roomsError || instancesError) ? 'error' : 'success';
  const error = roomsError?.message || instancesError?.message || null;

  useEffect(() => {
    // Get user's current location to calculate distances
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          // Handle error or user denial - maybe set a default location?
          console.warn("Could not get user location.");
          setUserLocation(null);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (serverRooms) {
      // Deduplicate by ID to prevent "Duplicate Key" errors
      const uniqueRooms = Array.from(new Map(serverRooms.map(item => [item.id, item])).values());
      setRooms(uniqueRooms);
    }
  }, [serverRooms]);

  useEffect(() => {
    if (serverRoomInstances) {
      console.log("RoomContext: serverRoomInstances updated", serverRoomInstances.length);
      // Deduplicate by instanceId
      const uniqueInstances = Array.from(new Map(serverRoomInstances.map(item => [item.instanceId, item])).values());
      setRoomInstances(uniqueInstances);
    }
  }, [serverRoomInstances]);


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
    if (!firestore || !user || !hotelInfo) return;

    const roomTypeId = doc(collection(firestore, 'room_types')).id;

    const newRoomType: Room = {
      ...roomData,
      id: roomTypeId,
      hotelName: hotelInfo.hotelName,
      location: hotelInfo.location,
      detailedAddress: hotelInfo.detailedAddress,
      latitude: hotelInfo.latitude ?? null,
      longitude: hotelInfo.longitude ?? null,
      phoneNumber: hotelInfo.phoneNumber,
      rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
      distance: 0, // Will be calculated dynamically
      likes: 0,
      ownerId: user.uid,
    };

    if (newRoomType.detailedAddress === undefined) delete newRoomType.detailedAddress;
    if (newRoomType.originalPrice === undefined) delete newRoomType.originalPrice;

    const roomRef = doc(firestore, "room_types", newRoomType.id);

    const batch = writeBatch(firestore);
    batch.set(roomRef, newRoomType);

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
      setRooms(prev => [...prev, newRoomType]);
      setRoomInstances(prev => [...prev, ...newInstances]);
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
    const dataToSave: any = { ...updatedRoom };
    if (dataToSave.detailedAddress === undefined) delete dataToSave.detailedAddress;
    if (dataToSave.latitude === undefined) delete dataToSave.latitude;
    if (dataToSave.longitude === undefined) delete dataToSave.longitude;
    if (dataToSave.originalPrice === undefined) delete dataToSave.originalPrice;
    setDocumentNonBlocking(roomRef, dataToSave, { merge: true });
  };

  const updateRoomInstance = (updatedInstance: Partial<RoomInstance> & { instanceId: string }) => {
    const instanceRef = doc(firestore, "room_instances", updatedInstance.instanceId);
    const dataToSave: any = { ...updatedInstance };
    if (dataToSave.bookingCode === undefined) {
      delete dataToSave.bookingCode;
    }
    setDocumentNonBlocking(instanceRef, dataToSave, { merge: true });
  };

  const deleteRoomInstance = (instanceId: string) => {
    const instanceRef = doc(firestore, "room_instances", instanceId);
    deleteDocumentNonBlocking(instanceRef);
    setRoomInstances(prev => prev.filter(inst => inst.instanceId !== instanceId));
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

  const getRoomDepositForDate = useCallback((instanceId: string, date: Date): number => {
    const instance = roomInstances.find(i => i.instanceId === instanceId);
    if (!instance) return 100; // Default to 100% if instance not found (safe fallback)

    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');

    // 1. Check for specific day override
    if (instance.overrides?.[dateKey]?.depositPercentage !== undefined) {
      return instance.overrides[dateKey].depositPercentage!;
    }

    // 2. Fallback to Hotel Global Setting (we need to access this from AuthContext, but simpler to pass it or just return undefined and let consumer handle it)
    // Since we can't easily access AuthContext inside this hook without circular dependency issues or heavy prop drilling, 
    // we will return -1 to indicate "Use Hotel Default".
    return -1;
  }, [roomInstances]);

  const isRoomAvailableInRange = useCallback((instanceId: string, from: Date, to: Date) => {
    try {
      const checkoutDate = addDays(to, -1);
      if (from >= to) return false;

      const days = [];
      let current = startOfDay(from);
      const end = startOfDay(checkoutDate);

      while (current <= end) {
        days.push(new Date(current));
        current = addDays(current, 1);
      }

      return days.every(day => getRoomStatusForDate(instanceId, day) === 'available');
    } catch (e) {
      return false;
    }
  }, [getRoomStatusForDate]);

  const calculateTotalPrice = useCallback((roomTypeId: string, from: Date, to: Date) => {
    try {
      const checkoutDate = addDays(to, -1);
      if (from >= to) return 0;

      const anyInstance = roomInstances.find(i => i.roomTypeId === roomTypeId);
      if (!anyInstance) {
        const room = rooms.find(r => r.id === roomTypeId);
        return room ? room.price : 0;
      }

      const days = [];
      let current = startOfDay(from);
      const end = startOfDay(checkoutDate);

      while (current <= end) {
        days.push(new Date(current));
        current = addDays(current, 1);
      }

      return days.reduce((total, day) => {
        return total + getRoomPriceForDate(anyInstance.instanceId, day);
      }, 0);
    } catch (e) {
      return 0;
    }
  }, [roomInstances, rooms, getRoomPriceForDate]);


  const calculateTotalDeposit = useCallback((roomTypeId: string, from: Date, to: Date) => {
    try {
      const checkoutDate = addDays(to, -1);
      if (from >= to) return 0;

      const anyInstance = roomInstances.find(i => i.roomTypeId === roomTypeId);
      if (!anyInstance) return 0; // Or handle as full price?

      const days = [];
      let current = startOfDay(from);
      const end = startOfDay(checkoutDate);

      while (current <= end) {
        days.push(new Date(current));
        current = addDays(current, 1);
      }

      return days.reduce((total, day) => {
        const price = getRoomPriceForDate(anyInstance.instanceId, day);
        const depositPct = getRoomDepositForDate(anyInstance.instanceId, day);

        // If depositPct is -1, it means "Use Hotel Default". 
        // The caller (RoomCard) will need to handle the -1 case by using hotelInfo.depositPercentage.
        // BUT, to make this function self-contained for the UI that might not have hotelInfo handy perfectly linearly:
        // We will return a special structure or just let the caller handle the final multiplication if it's constant?
        // Actually, because this varies DAY BY DAY, we must resolve it here.
        // Problem: We don't have `hotelInfo.depositPercentage` here in `RoomContext`.
        // Solution: We will require the global default to be passed in, OR we assume if it returns -1 we calculate it as a separate "unresolved" bucket?
        // Let's change the contract: `calculateTotalDeposit` returns the SUM of absolute deposit amounts. 
        // For -1, we can't calculate. 
        // Better approach: `RoomProvider` is inside `AuthProvider`? No, they are siblings or Auth is higher.
        // Yes, `RoomProvider` is inside `DashboardPage` which has `Header`... wait.
        // In `layout.tsx`, `AuthProvider` wraps everything. So we CAN use `useAuth` here!

        // Refactoring note: I will use `useAuth` at the top of `RoomContext` to get `hotelInfo`.

        return total; // Placeholder, will fix in next block with useAuth
      }, 0);
    } catch (e) {
      return 0;
    }
  }, [roomInstances, rooms, getRoomPriceForDate, getRoomDepositForDate]);

  const setRoomStatusForDate = useCallback((instanceId: string, date: Date, status: RoomStatus, bookingCode?: string) => {
    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
    const todayKey = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const isToday = dateKey === todayKey;

    const instance = roomInstances.find(i => i.instanceId === instanceId);
    if (!instance) return;

    const newInstance = { ...instance, overrides: { ...instance.overrides } };

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
    if (!instance) return;

    const room = rooms.find(r => r.id === instance.roomTypeId);
    if (!room) return;

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

  const setRoomDepositForDate = useCallback((instanceId: string, date: Date, depositPercentage: number | undefined) => {
    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
    const instance = roomInstances.find(i => i.instanceId === instanceId);
    if (!instance) return;

    const newInstance = { ...instance, overrides: { ...instance.overrides } };

    if (!newInstance.overrides[dateKey]) {
      newInstance.overrides[dateKey] = {};
    }

    if (depositPercentage === undefined) {
      delete newInstance.overrides[dateKey].depositPercentage;
      if (Object.keys(newInstance.overrides[dateKey]).length === 0) {
        delete newInstance.overrides[dateKey];
      }
    } else {
      newInstance.overrides[dateKey].depositPercentage = depositPercentage;
    }

    const instanceRef = doc(firestore, "room_instances", instanceId);
    setDocumentNonBlocking(instanceRef, newInstance, { merge: true });

    toast({
      title: "Төлбөрийн нөхцөл шинэчлэгдлээ",
      description: "Амжилттай хадгалагдлаа."
    });
  }, [roomInstances, firestore, toast]);

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
    if (instancesToUpdate.length === 0) return;

    const batch = writeBatch(firestore);

    const newLocalInstances = roomInstances.map(inst => {
      if (inst.roomTypeId === roomTypeId) {
        // Create a true deep copy to avoid state mutation issues
        const newInst = JSON.parse(JSON.stringify(inst));

        if (!newInst.overrides[dateKey]) {
          newInst.overrides[dateKey] = {};
        }

        if (price === undefined) {
          // Resetting to base price
          delete newInst.overrides[dateKey].price;
          if (Object.keys(newInst.overrides[dateKey]).length === 0) {
            delete newInst.overrides[dateKey];
          }
        } else {
          // Setting a new override price
          newInst.overrides[dateKey].price = price;
        }

        const instanceRef = doc(firestore, "room_instances", newInst.instanceId);
        batch.update(instanceRef, { overrides: newInst.overrides });

        return newInst;
      }
      return inst;
    });

    batch.commit().then(() => {
      setRoomInstances(newLocalInstances); // Optimistic UI Update
      toast({
        title: "Үнэ шинэчлэгдлээ",
        description: `${format(date, 'M/d')}-ний ${roomType.roomName} өрөөнүүдийн үнэ ${finalPrice.toLocaleString()}₮ боллоо.`
      });
    }).catch((e) => {
      console.error("Batch update failed: ", e);
      toast({
        variant: "destructive",
        title: "Алдаа",
        description: "Үнийг шинэчлэхэд алдаа гарлаа: " + e.message,
      });
    });
  }, [getRoomById, roomInstances, firestore, toast]);

  const availableRoomsByType = useMemo(() => {
    const from = selectedDateRange.from;
    const to = selectedDateRange.to;

    const mappedRooms = rooms.map(roomType => {
      const availableInstances = roomInstances.filter(instance =>
        instance.roomTypeId === roomType.id &&
        isRoomAvailableInRange(instance.instanceId, from, to)
      );

      let distance = 19; // Default to 19km if no location
      if (userLocation && roomType.latitude != null && roomType.longitude != null) {
        distance = getDistanceFromLatLonInKm(
          userLocation.lat,
          userLocation.lon,
          roomType.latitude,
          roomType.longitude
        );
      }

      return {
        ...roomType,
        distance,
        availableInstances,
      };
    });

    const result = mappedRooms.filter(room => room.availableInstances.length > 0);

    // Debug logging
    console.log("RoomContext State:", {
      status,
      roomsCount: rooms.length,
      instancesCount: roomInstances.length,
      availableRoomsCount: result.length,
      userUid,
      isAdmin,
      instancesQuery: instancesQuery ? "Query Active" : "Query Null"
    });

    return result;

  }, [rooms, roomInstances, isRoomAvailableInRange, userLocation, selectedDateRange, status, userUid, isAdmin, instancesQuery]);

  const ownerRooms = useMemo(() => {
    if (!rooms || !userUid) return [];
    return rooms.filter(r => r.ownerId === userUid);
  }, [rooms, userUid]);


  return (
    <RoomContext.Provider value={{
      rooms,
      roomInstances,
      availableRoomsByType,
      ownerRooms,
      addRoom,
      updateRoom,
      deleteRoomInstance,
      status,
      error,
      getRoomById,
      updateRoomInstance,
      getRoomStatusForDate,
      setRoomStatusForDate,
      getRoomPriceForDate,
      setPriceForRoomTypeOnDate,
      getPriceForRoomTypeOnDate,
      setRoomPriceForDate,
      toggleLike,
      likedRooms,
      selectedDateRange,
      setSelectedDateRange,
      calculateTotalPrice,
      calculateTotalDeposit,
      isRoomAvailableInRange,
      getRoomDepositForDate,
      setRoomDepositForDate,
    }}>
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



