
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRoom } from "@/context/RoomContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfDay, subDays, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import DashboardStats from "@/components/dashboard/DashboardStats";

export type TimeRange = '7d' | '14d' | '30d';

export type ChartDataPoint = {
  date: string;
  revenue: number;
  occupancy: number;
  adr: number;
};

export default function StatsClient() {
  const { userEmail, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { roomInstances, status: roomStatus, getRoomStatusForDate, getRoomPriceForDate } = useRoom();
  const router = useRouter();

  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isAuthLoading, router]);

  const ownerRoomInstances = useMemo(() => roomInstances.filter(inst => inst.ownerId === userEmail), [roomInstances, userEmail]);

  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const totalRooms = ownerRoomInstances.length;

    // Time Interval Calculation
    const daysToAnalyze = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const interval = { start: subDays(today, daysToAnalyze - 1), end: today };
    const dateRange = eachDayOfInterval(interval);

    // Per-day calculation
    const dailyData = dateRange.map(date => {
      let dailyRevenue = 0;
      let occupiedRooms = 0;
      ownerRoomInstances.forEach(instance => {
        const status = getRoomStatusForDate(instance.instanceId, date);
        if (status === 'occupied' || status === 'booked') {
          const price = getRoomPriceForDate(instance.instanceId, date);
          dailyRevenue += price;
          occupiedRooms++;
        }
      });
      const occupancy = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
      const adr = occupiedRooms > 0 ? dailyRevenue / occupiedRooms : 0;

      return { date, dailyRevenue, occupiedRooms, occupancy, adr };
    });

    // Chart Data Generation
    const chartData: ChartDataPoint[] = dailyData.map(d => ({
        date: format(d.date, 'M/d'),
        revenue: d.dailyRevenue,
        occupancy: d.occupancy,
        adr: d.adr,
    }));
    
    // Overall Stats for the selected period
    const totalRevenue = dailyData.reduce((sum, d) => sum + d.dailyRevenue, 0);
    const totalOccupiedRoomDays = dailyData.reduce((sum, d) => sum + d.occupiedRooms, 0);
    const totalAvailableRoomDays = totalRooms * daysToAnalyze;
    
    const overallOccupancy = totalAvailableRoomDays > 0 ? (totalOccupiedRoomDays / totalAvailableRoomDays) * 100 : 0;
    const overallAdr = totalOccupiedRoomDays > 0 ? totalRevenue / totalOccupiedRoomDays : 0;
    const overallRevPar = totalAvailableRoomDays > 0 ? totalRevenue / totalAvailableRoomDays : 0;
    
    // Quick Stats
    const todayData = dailyData.find(d => isSameDay(d.date, today));
    
    const weeklyInterval = { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
    const weekRevenue = dailyData
        .filter(d => d.date >= weeklyInterval.start && d.date <= weeklyInterval.end)
        .reduce((sum, d) => sum + d.dailyRevenue, 0);

    const monthlyInterval = { start: startOfMonth(today), end: endOfMonth(today) };
    const monthRevenue = dailyData
        .filter(d => d.date >= monthlyInterval.start && d.date <= monthlyInterval.end)
        .reduce((sum, d) => sum + d.dailyRevenue, 0);

    return { 
        revPar: overallRevPar,
        adr: overallAdr,
        occupancy: overallOccupancy,
        todaysRevenue: todayData?.dailyRevenue || 0,
        weekRevenue,
        monthRevenue,
        chartData
    };

  }, [ownerRoomInstances, getRoomStatusForDate, getRoomPriceForDate, timeRange]);


  const isLoading = isAuthLoading || roomStatus === 'loading';

  if (isLoading || !isLoggedIn) {
    return (
        <div className="space-y-6">
             <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-[350px] w-full" />
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
      </div>
    );
  }

  return <DashboardStats stats={stats} timeRange={timeRange} setTimeRange={setTimeRange} />
}
