

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRoom } from "@/context/RoomContext";
import { Room, RoomInstance, RoomStatus } from "@/lib/data";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ListFilter, ArrowUpDown, Lightbulb } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { RoomForm } from "../rooms/RoomForm";
import { RoomInstanceCard } from "./RoomInstanceCard";
import { format, addDays, isToday, startOfDay } from 'date-fns';
import { mn } from 'date-fns/locale';
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "@/lib/utils";
import { RecommendationCard } from "./RecommendationCard";

type SortOption = 'roomNumber' | 'roomType' | 'status';

export default function DashboardClient() {
  const { userEmail, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { ownerRooms, roomInstances, status: roomStatus, deleteRoomInstance, getRoomStatusForDate, getRoomById } = useRoom();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [roomTypeToEdit, setRoomTypeToEdit] = useState<Room | null>(null);
  const [instanceToDelete, setInstanceToDelete] = useState<RoomInstance | null>(null);

  // Filtering and Sorting State
  const [sortOption, setSortOption] = useState<SortOption>('roomNumber');
  const [filterRoomType, setFilterRoomType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');


  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isAuthLoading, router]);

  const ownerRoomInstances = useMemo(() => {
    if (!roomInstances) return [];
    return roomInstances.filter(inst => inst.ownerId === userEmail)
  }, [roomInstances, userEmail]);

  const filteredAndSortedInstances = useMemo(() => {
    const instancesWithStatus = ownerRoomInstances
      .map(instance => {
          const statusForDate = getRoomStatusForDate(instance.instanceId, selectedDate);
          const dateKey = format(startOfDay(selectedDate), 'yyyy-MM-dd');
          
          let bookingCodeForDate: string | undefined;
          if (statusForDate === 'booked') {
            const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;
            if (isToday) {
                bookingCodeForDate = instance.bookingCode;
            } else {
                bookingCodeForDate = instance.overrides?.[dateKey]?.bookingCode;
            }
          }

          return {
            ...instance,
            status: statusForDate,
            bookingCode: bookingCodeForDate,
          };
      });

    const filtered = instancesWithStatus.filter(instance => {
      const roomTypeMatch = filterRoomType === 'all' || instance.roomTypeId === filterRoomType;
      const statusMatch = filterStatus === 'all' || instance.status === filterStatus;
      return roomTypeMatch && statusMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'roomType':
          const roomA = getRoomById(a.roomTypeId);
          const roomB = getRoomById(b.roomTypeId);
          return (roomA?.roomName || '').localeCompare(roomB?.roomName || '');
        case 'status':
           const statusOrder: Record<RoomStatus, number> = { 'booked': 1, 'occupied': 2, 'available': 3, 'maintenance': 4, 'closed': 5 };
           return statusOrder[a.status] - statusOrder[b.status];
        case 'roomNumber':
        default:
          return (a.roomNumber || "").localeCompare(b.roomNumber || "", undefined, { numeric: true });
      }
    });

    return sorted;

  }, [ownerRoomInstances, selectedDate, getRoomStatusForDate, filterRoomType, filterStatus, sortOption, getRoomById]);

  const isLoading = isAuthLoading || roomStatus === 'loading';

  const handleDelete = () => {
    if (instanceToDelete) {
      deleteRoomInstance(instanceToDelete.instanceId);
      setInstanceToDelete(null);
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
        setSelectedDate(date);
    }
  }
  
  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Өнөөдөр";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (selectedDate.toDateString() === tomorrow.toDateString()) return "Маргааш";
    return format(selectedDate, 'MMM d', { locale: mn });
  }


  if (isLoading || !isLoggedIn) {
    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-9 w-48" />
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight mb-8">Миний өрөөнүүд</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-[200px] w-full" />
                ))}
            </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Миний өрөөнүүд</h1>

            <div className="flex flex-wrap items-center gap-4">
                 <div className="flex items-center gap-1 p-1.5 border rounded-lg bg-background shadow-sm w-fit">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDateChange(addDays(selectedDate, -1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                           variant={"outline"}
                           className={cn(
                                "w-36 flex-1 h-8 justify-start text-left font-normal text-sm",
                               !isToday(selectedDate) && "text-destructive focus:text-destructive"
                           )}
                        >
                            <CalendarIcon className={cn("mr-2 h-4 w-4")} />
                            {getDateLabel()}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            locale={mn}
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => handleDateChange(date)}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDateChange(addDays(selectedDate, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                 <Popover>
                    <PopoverTrigger asChild>
                       <Button variant="outline" className="h-10 text-yellow-500 border-yellow-400/50 bg-yellow-400/10 hover:bg-yellow-400/20 hover:text-yellow-600">
                           <Lightbulb className="mr-2 h-4 w-4"/>
                           Ухаалаг Зөвлөмж
                       </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="start">
                        <RecommendationCard selectedDate={selectedDate} />
                    </PopoverContent>
                </Popover>

                <div className="flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-muted-foreground" />
                    <Select value={filterRoomType} onValueChange={setFilterRoomType}>
                        <SelectTrigger className="h-10 w-32"><SelectValue placeholder="Төрөл" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Бүх төрөл</SelectItem>
                            {ownerRooms.map(rt => <SelectItem key={rt.id} value={rt.id}>{rt.roomName}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-10 w-32"><SelectValue placeholder="Төлөв" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Бүх төлөв</SelectItem>
                            <SelectItem value="available">Сул</SelectItem>
                            <SelectItem value="booked">Захиалгатай</SelectItem>
                            <SelectItem value="occupied">Байрлаж байна</SelectItem>
                            <SelectItem value="maintenance">Засвартай</SelectItem>
                            <SelectItem value="closed">Хаалттай</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="h-6 border-l border-border/50 hidden md:block"></div>

                <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                    <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                        <SelectTrigger className="h-10 w-36"><SelectValue placeholder="Эрэмбэлэх" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="roomNumber">Өрөөний дугаар</SelectItem>
                            <SelectItem value="roomType">Өрөөний төрөл</SelectItem>
                            <SelectItem value="status">Төлөв</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
        
        <div>
            {filteredAndSortedInstances.length === 0 ? (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Өрөө олдсонгүй</AlertTitle>
                    <AlertDescription>
                        Таны сонгосон шүүлтүүрт тохирох өрөө олдсонгүй. Эсвэл та одоогоор ямар ч өрөө оруулаагүй байна.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredAndSortedInstances.map(instance => (
                        <RoomInstanceCard 
                          key={instance.instanceId} 
                          instance={instance}
                          onEditType={(roomType) => setRoomTypeToEdit(roomType)}
                          onDeleteInstance={(instance) => setInstanceToDelete(instance)}
                          selectedDate={selectedDate}
                        />
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!instanceToDelete} onOpenChange={(open) => !open && setInstanceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Та энэ өрөөг устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
            <AlertDialogDescription>
              Энэ үйлдлийг буцаах боломжгүй. Энэ нь {instanceToDelete?.roomNumber} тоот өрөөний мэдээллийг устгах болно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Устгах</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       {/* Edit Dialog */}
       <Dialog open={!!roomTypeToEdit} onOpenChange={(open) => !open && setRoomTypeToEdit(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Өрөөний төрөл засах</DialogTitle>
            <DialogDescription>
              Энд хийсэн өөрчлөлт энэ төрлийн бүх өрөөнд нөлөөлнө.
            </DialogDescription>
          </DialogHeader>
          <RoomForm
            roomToEdit={roomTypeToEdit}
            onFormSubmit={() => setRoomTypeToEdit(null)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

    
