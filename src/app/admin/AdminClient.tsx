
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRoom } from "@/context/RoomContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { HotelInfo } from "@/context/AuthContext";
import { Building2, Bed, BarChart4, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SERVICE_FEE_PER_BOOKING = 5000;

function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}


export default function AdminClient() {
  const { userEmail, isLoggedIn, isLoading: isAuthLoading, isAdmin } = useAuth();
  const { rooms, roomInstances, status: roomStatus } = useRoom();
  const router = useRouter();
  const firestore = useFirestore();

  const hotelsQuery = useMemoFirebase(() => collection(firestore, 'hotels'), [firestore]);
  const { data: hotels = [], isLoading: isHotelsLoading } = useCollection<HotelInfo>(hotelsQuery);
  
  useEffect(() => {
    if (!isAuthLoading && (!isLoggedIn || !isAdmin)) {
      router.push("/");
    }
  }, [isLoggedIn, isAuthLoading, isAdmin, router]);

  const stats = useMemo(() => {
    const totalBookings = roomInstances.reduce((acc, inst) => {
        const overrides = inst.overrides || {};
        const bookedDates = Object.values(overrides).filter(o => o.status === 'booked' || o.status === 'occupied').length;
        return acc + bookedDates;
    }, 0);

    const totalRevenue = roomInstances.reduce((acc, inst) => {
        const overrides = inst.overrides || {};
        const room = rooms.find(r => r.id === inst.roomTypeId);
        if (!room) return acc;

        const bookingRevenue = Object.entries(overrides).reduce((dailyAcc, [date, override]) => {
            if (override.status === 'booked' || override.status === 'occupied') {
                return dailyAcc + (override.price ?? room.price);
            }
            return dailyAcc;
        }, 0);

        return acc + bookingRevenue;
    }, 0);
    
    const totalServiceFees = totalBookings * SERVICE_FEE_PER_BOOKING;

    return {
        totalHotels: hotels.length,
        totalRoomTypes: rooms.length,
        totalRoomInstances: roomInstances.length,
        totalRevenue,
        totalServiceFees,
    }
  }, [hotels, rooms, roomInstances])

  const isLoading = isAuthLoading || roomStatus === 'loading' || isHotelsLoading;

  if (isLoading || !isLoggedIn || !isAdmin) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div>
        <h1 className="text-3xl font-bold tracking-tight">Админ удирдлагын самбар</h1>
        <p className="text-muted-foreground">Системийн ерөнхий статистик болон удирдлага.</p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mt-8">
            <StatCard title="Нийт буудал" value={stats.totalHotels} icon={Building2} />
            <StatCard title="Нийт өрөөний төрөл" value={stats.totalRoomTypes} icon={Bed} />
            <StatCard title="Нийт өрөө" value={stats.totalRoomInstances} icon={BarChart4} />
            <StatCard title="Нийт борлуулалт" value={`${stats.totalRevenue.toLocaleString()}₮`} icon={Banknote} />
            <StatCard title="Нийт шимтгэл" value={`${stats.totalServiceFees.toLocaleString()}₮`} icon={Banknote} />
        </div>

        {/* TODO: Add Hotels List Table Here */}
    </div>
  );
}
