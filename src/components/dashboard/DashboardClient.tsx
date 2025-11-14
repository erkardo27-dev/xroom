"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRoom } from "@/context/RoomContext";
import { RoomCard } from "@/components/rooms/RoomCard";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info, X } from "lucide-react";
import { Room } from "@/lib/data";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { RoomForm } from "../rooms/RoomForm";

export default function DashboardClient() {
  const { userEmail, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { rooms, status: roomStatus, deleteRoom } = useRoom();
  const router = useRouter();

  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);

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

  const handleDelete = () => {
    if (roomToDelete) {
      deleteRoom(roomToDelete.id);
      setRoomToDelete(null);
    }
  }

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
    <>
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
                      <RoomCard 
                        key={room.id} 
                        room={room} 
                        isDashboard 
                        onEdit={() => setRoomToEdit(room)}
                        onDelete={() => setRoomToDelete(room)}
                      />
                  ))}
              </div>
          )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!roomToDelete} onOpenChange={(open) => !open && setRoomToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Та энэ өрөөг устгахдаа итгэлтэй байна уу?</AlertDialogTitle>
            <AlertDialogDescription>
              Энэ үйлдлийг буцаах боломжгүй. Энэ нь таны өрөөний мэдээллийг манай серверээс бүрмөсөн устгах болно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Устгах</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       {/* Edit Dialog */}
       <Dialog open={!!roomToEdit} onOpenChange={(open) => !open && setRoomToEdit(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Өрөөний мэдээлэл засах</DialogTitle>
            <DialogDescription>
              Өрөөний мэдээллийг доорх талбаруудад өөрчлөн хадгална уу.
            </DialogDescription>
          </DialogHeader>
          <RoomForm
            roomToEdit={roomToEdit}
            onFormSubmit={() => setRoomToEdit(null)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
