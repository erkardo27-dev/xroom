"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRoom } from "@/context/RoomContext";
import { Room, RoomInstance } from "@/lib/data";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { RoomForm } from "../rooms/RoomForm";
import { RoomInstanceCard } from "./RoomInstanceCard";
import { format, addDays, isToday, startOfDay } from 'date-fns';
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";

export default function DashboardClient() {
  const { userEmail, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { rooms, roomInstances, status: roomStatus, deleteRoom, getRoomStatusForDate } = useRoom();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [roomTypeToEdit, setRoomTypeToEdit] = useState<Room | null>(null);
  const [roomTypeToDelete, setRoomTypeToDelete] = useState<Room | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isAuthLoading, router]);

  const ownerRoomInstances = useMemo(() => {
    if (!userEmail) return [];
    const instances = roomInstances.filter(instance => instance.ownerId === userEmail);
    
    // Augment instances with status for the selected date
    return instances.map(instance => ({
      ...instance,
      status: getRoomStatusForDate(instance.instanceId, selectedDate),
    }));

  }, [roomInstances, userEmail, selectedDate, getRoomStatusForDate]);

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
          <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Миний өрөөнүүд</h1>
            <div className="flex items-center gap-2 p-2 rounded-lg border bg-card">
              <Button variant="outline" size="icon" onClick={() => handleDateChange(addDays(selectedDate, -1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-[200px] justify-start text-left font-normal"
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
               <Button variant="outline" onClick={() => handleDateChange(addDays(selectedDate, 1))}>
                Маргааш
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleDateChange(addDays(selectedDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {ownerRoomInstances.length === 0 ? (
              <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Өрөө оруулаагүй байна</AlertTitle>
                  <AlertDescription>
                      Та одоогоор ямар ч өрөө оруулаагүй байна. "Шинэ өрөөний төрөл" товчийг дарж өрөөгөө нэмнэ үү.
                  </AlertDescription>
              </Alert>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {ownerRoomInstances.map(instance => (
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
