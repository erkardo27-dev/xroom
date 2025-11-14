
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRoom } from "@/context/RoomContext";
import { Room, RoomInstance, RoomStatus } from "@/lib/data";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ListFilter, ArrowUpDown } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { RoomForm } from "../rooms/RoomForm";
import { RoomInstanceCard } from "./RoomInstanceCard";
import { format, addDays, isToday, startOfDay } from 'date-fns';
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";

type SortOption = 'roomNumber' | 'roomType' | 'status';

export default function DashboardClient() {
  const { userEmail, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { rooms, roomInstances, status: roomStatus, deleteRoom, getRoomStatusForDate, getRoomById } = useRoom();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [roomTypeToEdit, setRoomTypeToEdit] = useState<Room | null>(null);
  const [roomTypeToDelete, setRoomTypeToDelete] = useState<Room | null>(null);

  // Filtering and Sorting State
  const [sortOption, setSortOption] = useState<SortOption>('roomNumber');
  const [filterRoomType, setFilterRoomType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');


  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isAuthLoading, router]);

  const ownerRoomTypes = useMemo(() => {
      return rooms.filter(r => r.ownerId === userEmail);
  }, [rooms, userEmail]);

  const filteredAndSortedInstances = useMemo(() => {
    if (!userEmail) return [];
    
    // 1. Get all instances for the owner and augment with status for the selected date
    const instancesWithStatus = roomInstances
      .filter(instance => instance.ownerId === userEmail)
      .map(instance => {
          const statusForDate = getRoomStatusForDate(instance.instanceId, selectedDate);
          return {
            ...instance,
            status: statusForDate,
            // Also update booking code based on override status
            bookingCode: statusForDate === 'booked' ? instance.overrides?.[format(selectedDate, 'yyyy-MM-dd')]?.bookingCode || instance.bookingCode : undefined,
          };
      });

    // 2. Filter instances
    const filtered = instancesWithStatus.filter(instance => {
      const roomTypeMatch = filterRoomType === 'all' || instance.roomTypeId === filterRoomType;
      const statusMatch = filterStatus === 'all' || instance.status === filterStatus;
      return roomTypeMatch && statusMatch;
    });

    // 3. Sort instances
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
          return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
      }
    });

    return sorted;

  }, [roomInstances, userEmail, selectedDate, getRoomStatusForDate, filterRoomType, filterStatus, sortOption, getRoomById]);

  const isLoading = isAuthLoading || roomStatus === 'loading';

  const handleDelete = () => {
    if (roomTypeToDelete) {
      deleteRoom(roomTypeToDelete.id);
      setRoomTypeToDelete(null);
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
        setSelectedDate(startOfDay(date));
    }
  }

  if (isLoading || !isLoggedIn) {
    return (
        <div className="space-y-4">
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
           <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Миний өрөөнүүд</h1>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg border bg-card">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDateChange(addDays(selectedDate, -1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-[150px] h-8 justify-start text-left font-normal text-sm"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {isToday(selectedDate) ? "Өнөөдөр" : format(selectedDate, 'MMM d')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => handleDateChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
               <Button variant="outline" size="sm" className="h-8" onClick={() => handleDateChange(addDays(selectedDate, 1))}>
                Маргааш
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDateChange(addDays(selectedDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-end mb-8 p-3 border rounded-lg bg-secondary/30">
              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label className="text-xs font-semibold flex items-center gap-1"><ListFilter className="w-3.5 h-3.5"/>Шүүлтүүр</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Select value={filterRoomType} onValueChange={setFilterRoomType}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Төрөл" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Бүх төрөл</SelectItem>
                                {ownerRoomTypes.map(rt => <SelectItem key={rt.id} value={rt.id}>{rt.roomName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Төлөв" /></SelectTrigger>
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
                </div>
                 <div className="space-y-1">
                    <Label className="text-xs font-semibold flex items-center gap-1"><ArrowUpDown className="w-3.5 h-3.5"/>Эрэмбэлэлт</Label>
                     <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Эрэмбэлэх" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="roomNumber">Өрөөний дугаар</SelectItem>
                            <SelectItem value="roomType">Өрөөний төрөл</SelectItem>
                            <SelectItem value="status">Төлөв</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
          </div>


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
                        onDeleteType={(roomType) => setRoomTypeToDelete(roomType)}
                        selectedDate={selectedDate}
                      />
                  ))}
              </div>
          )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!roomTypeToDelete} onOpenChange={(open) => !open && setRoomTypeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Та энэ өрөөний төрлийг устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
            <AlertDialogDescription>
              Энэ үйлдлийг буцаах боломжгүй. Энэ нь таны сонгосон өрөөний төрөл болон түүнд хамаарах бүх өрөөний мэдээллийг устгах болно.
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
