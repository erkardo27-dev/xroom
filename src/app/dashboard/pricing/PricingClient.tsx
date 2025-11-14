
"use client";

import { useEffect, useState, useMemo, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRoom } from "@/context/RoomContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Room } from "@/lib/data";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addDays, format } from "date-fns";
import { mn } from "date-fns/locale";
import { cn } from "@/lib/utils";


export default function PricingClient() {
  const { userEmail, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { rooms, status: roomStatus, getPriceForRoomTypeOnDate, setPriceForRoomTypeOnDate } = useRoom();
  const router = useRouter();

  const [editingCell, setEditingCell] = useState<string | null>(null); // "roomTypeId-date"
  const [editingValue, setEditingValue] = useState<string>("");

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isAuthLoading, router]);

  const ownerRoomTypes = useMemo(() => {
    return rooms.filter(r => r.ownerId === userEmail);
  }, [rooms, userEmail]);

  const dateColumns = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => addDays(today, i));
  }, []);

  const handleCellClick = (room: Room, date: Date) => {
    const price = getPriceForRoomTypeOnDate(room.id, date);
    setEditingCell(`${room.id}-${format(date, 'yyyy-MM-dd')}`);
    setEditingValue(price.toString());
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value);
  }

  const handleInputBlur = () => {
    if (!editingCell) return;

    const [roomTypeId, dateStr] = editingCell.split('-');
    const newPrice = editingValue.trim() === '' ? undefined : Number(editingValue);

    if (newPrice === undefined || !isNaN(newPrice)) {
        setPriceForRoomTypeOnDate(roomTypeId, new Date(dateStr), newPrice);
    }
    
    setEditingCell(null);
    setEditingValue("");
  }
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditingValue("");
    }
  }


  const isLoading = isAuthLoading || roomStatus === 'loading';

  if (isLoading || !isLoggedIn) {
    return (
        <div className="space-y-4">
            <div className="border rounded-lg p-2">
                <Skeleton className="h-12 w-full mb-2" />
                {Array.from({length: 4}).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full mb-1" />
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="border rounded-lg">
        <Table>
            <TableCaption>Энд дарж үнээ өөрчлөөрэй. Хоосон орхивол үндсэн үнээр тооцогдоно.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="font-bold text-foreground min-w-[150px] sticky left-0 bg-background z-10">Өрөөний төрөл</TableHead>
                    {dateColumns.map(date => (
                        <TableHead key={date.toString()} className="text-center min-w-[120px]">
                            <div>{format(date, 'M/dd')}</div>
                            <div className="text-xs font-normal text-muted-foreground">{format(date, 'EEE', {locale: mn})}</div>
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {ownerRoomTypes.map(room => (
                    <TableRow key={room.id}>
                        <TableCell className="font-semibold sticky left-0 bg-background z-10">
                            <div>{room.roomName}</div>
                            <div className="text-xs text-muted-foreground font-normal">{room.price.toLocaleString()}₮</div>
                        </TableCell>
                         {dateColumns.map(date => {
                            const cellId = `${room.id}-${format(date, 'yyyy-MM-dd')}`;
                            const isEditing = editingCell === cellId;
                            const price = getPriceForRoomTypeOnDate(room.id, date);
                            const isOverridden = price !== room.price;

                            return (
                                <TableCell 
                                    key={date.toString()} 
                                    className="text-center cursor-pointer"
                                    onClick={() => handleCellClick(room, date)}
                                >
                                    {isEditing ? (
                                        <Input 
                                            type="number"
                                            value={editingValue}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            onKeyDown={handleInputKeyDown}
                                            autoFocus
                                            className="w-24 mx-auto text-center font-semibold"
                                        />
                                    ) : (
                                        <div className={cn(
                                            "font-semibold w-24 mx-auto p-2 rounded-md",
                                            isOverridden && "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400"
                                        )}>
                                            {price.toLocaleString()}₮
                                        </div>
                                    )}
                                </TableCell>
                            )
                         })}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  )
}
