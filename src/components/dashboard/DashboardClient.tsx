"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRoom } from "@/context/RoomContext";
import { RoomCard } from "@/components/rooms/RoomCard";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info } from "lucide-react";

export default function DashboardClient() {
  const { userEmail, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { rooms, status: roomStatus } = useRoom();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isAuthLoading, router]);

  const ownerRooms = useMemo(() => {
    if (!userEmail) return [];
    return rooms.filter(room => room.ownerId === userEmail);
  }, [rooms, userEmail]);

  const isLoading = isAuthLoading || roomStatus === 'loading';

  if (isLoading || !isLoggedIn) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-96 w-full" />
                ))}
            </div>
      </div>
    );
  }

  return (
    <div>
        <h1 className="text-3xl font-bold tracking-tight mb-8">Миний өрөөнүүд</h1>

        {ownerRooms.length === 0 ? (
             <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Өрөө оруулаагүй байна</AlertTitle>
                <AlertDescription>
                    Та одоогоор ямар ч өрөө оруулаагүй байна. "Шинэ өрөө" товчийг дарж өрөөгөө нэмнэ үү.
                </AlertDescription>
            </Alert>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {ownerRooms.map(room => (
                    <RoomCard key={room.id} room={room} />
                ))}
            </div>
        )}
    </div>
  );
}
