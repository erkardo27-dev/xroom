"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRoom } from "@/context/RoomContext";
import { Room, RoomInstance } from "@/lib/data";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { RoomForm } from "../rooms/RoomForm";
import { RoomInstanceCard } from "./RoomInstanceCard";

export default function DashboardClient() {
  const { userEmail, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { rooms, roomInstances, status: roomStatus, deleteRoom } = useRoom();
  const router = useRouter();

  const [roomTypeToEdit, setRoomTypeToEdit] = useState<Room | null>(null);
  const [roomTypeToDelete, setRoomTypeToDelete] = useState<Room | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isAuthLoading, router]);

  const ownerRoomInstances = useMemo(() => {
    if (!userEmail) return [];
    return roomInstances.filter(instance => instance.ownerId === userEmail);
  }, [roomInstances, userEmail]);

  const isLoading = isAuthLoading || roomStatus === 'loading';

  const handleDelete = () => {
    if (roomTypeToDelete) {
      deleteRoom(roomTypeToDelete.id);
      setRoomTypeToDelete(null);
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
          <h1 className="text-3xl font-bold tracking-tight mb-8">Миний өрөөнүүд</h1>

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
