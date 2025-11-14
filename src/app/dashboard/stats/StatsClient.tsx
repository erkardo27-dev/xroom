"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRoom } from "@/context/RoomContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, startOfDay, subDays, eachDayOfInterval, getDate, getDaysInMonth } from 'date-fns';
import DashboardStats from "@/components/dashboard/DashboardStats";

export default function StatsClient() {
  const { userEmail, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { roomInstances, status: roomStatus, getRoomStatusForDate, getRoomPriceForDate } = useRoom();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isAuthLoading, router]);

  const ownerRoomInstances = useMemo(() => roomInstances.filter(inst => inst.ownerId === userEmail), [roomInstances, userEmail]);

  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const startOfCurrentMonth = startOfMonth(today);
    const daysInMonthSoFar = getDate(today);

    let todaysRevenue = 0;
    let monthRevenue = 0;
    let occupiedToday = 0;
    let monthlyOccupiedRoomDays = 0;

    const sevenDayInterval = { start: subDays(today, 6), end: today };
    const last7Days = eachDayOfInterval(sevenDayInterval);
    const dailyRevenue = last7Days.map(date => ({
      date: format(date, 'MM/dd'),
      revenue: 0,
    }));

    ownerRoomInstances.forEach(instance => {
      // Today's stats
      const todayStatus = getRoomStatusForDate(instance.instanceId, today);
      if (todayStatus === 'occupied' || todayStatus === 'booked') {
        const price = getRoomPriceForDate(instance.instanceId, today);
        todaysRevenue += price;
        occupiedToday++;
      }
      
      // Last 7 days stats
      last7Days.forEach((day, index) => {
        const status = getRoomStatusForDate(instance.instanceId, day);
        if (status === 'occupied' || status === 'booked') {
          const price = getRoomPriceForDate(instance.instanceId, day);
          dailyRevenue[index].revenue += price;
        }
      });
      
      // This month stats
       const monthDays = eachDayOfInterval({start: startOfCurrentMonth, end: today});
       monthDays.forEach(day => {
         const status = getRoomStatusForDate(instance.instanceId, day);
         if (status === 'occupied' || status === 'booked') {
             const price = getRoomPriceForDate(instance.instanceId, day);
             monthRevenue += price;
             monthlyOccupiedRoomDays++;
         }
       })
    });

    const totalRooms = ownerRoomInstances.length;
    const occupancyToday = totalRooms > 0 ? (occupiedToday / totalRooms) * 100 : 0;
    
    // Advanced Metrics
    const totalRoomDaysInMonthSoFar = totalRooms * daysInMonthSoFar;
    const occupancyMonth = totalRoomDaysInMonthSoFar > 0 ? (monthlyOccupiedRoomDays / totalRoomDaysInMonthSoFar) * 100 : 0;
    const adr = monthlyOccupiedRoomDays > 0 ? monthRevenue / monthlyOccupiedRoomDays : 0; // Average Daily Rate
    const revPar = totalRoomDaysInMonthSoFar > 0 ? monthRevenue / totalRoomDaysInMonthSoFar : 0; // Revenue Per Available Room

    return { 
        todaysRevenue, 
        monthRevenue, 
        occupancyToday, 
        dailyRevenue,
        adr,
        revPar,
        occupancyMonth
    };

  }, [ownerRoomInstances, getRoomStatusForDate, getRoomPriceForDate]);


  const isLoading = isAuthLoading || roomStatus === 'loading';

  if (isLoading || !isLoggedIn) {
    return (
        <div className="space-y-6">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return <DashboardStats stats={stats} />
}
