
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
import { BrainCircuit, Loader2 } from "lucide-react";
import { getPricingRecommendation, PricingRecommendation } from "@/ai/flows/pricing-recommendation-flow";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


export default function PricingClient() {
  const { userEmail, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { rooms, status: roomStatus, getPriceForRoomTypeOnDate, setPriceForRoomTypeOnDate } = useRoom();
  const router = useRouter();

  const [editingCell, setEditingCell] = useState<string | null>(null); // "roomTypeId-date"
  const [editingValue, setEditingValue] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<PricingRecommendation | null>(null);

  const { toast } = useToast();

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

  const handleAiPriceSuggest = async () => {
    setIsAiLoading(true);
    try {
        // MOCK AI IMPLEMENTATION
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

        const mockRecommendations: Record<string, number> = {};
        ownerRoomTypes.forEach(room => {
            dateColumns.forEach(date => {
                // ~30% chance to recommend a change
                if (Math.random() < 0.3) {
                    const currentPrice = getPriceForRoomTypeOnDate(room.id, date);
                    // Change by -20% to +20%
                    const changeFactor = 1 + (Math.random() - 0.5) * 0.4; 
                    const newPrice = Math.round((currentPrice * changeFactor) / 1000) * 1000;
                    const key = `${room.id}_${format(date, 'yyyy-MM-dd')}`;
                    mockRecommendations[key] = newPrice;
                }
            });
        });

        const recommendation: PricingRecommendation = {
            summary: "Ачаалал, улирлын байдлыг харгалзан дараах үнийн саналыг шинэчиллээ.",
            recommendations: mockRecommendations,
        };

        // const recommendation = await getPricingRecommendation({
        //     roomTypes: ownerRoomTypes,
        //     dateRange: {
        //         startDate: format(dateColumns[0], 'yyyy-MM-dd'),
        //         endDate: format(dateColumns[dateColumns.length-1], 'yyyy-MM-dd'),
        //     }
        // });

        if (Object.keys(recommendation.recommendations).length === 0) {
           toast({
                title: "Өөрчлөлт санал болгосонгүй",
                description: "AI одоогийн үнийг хамгийн оновчтой гэж үзэж байна.",
            });
        } else {
            setAiRecommendation(recommendation);
        }

    } catch(e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "AI зөвлөмж амжилтгүй боллоо",
            description: "Дахин оролдоно уу.",
        });
    } finally {
        setIsAiLoading(false);
    }
  }
  
  const handleAcceptAiRecommendation = () => {
    if (!aiRecommendation?.recommendations) return;

    Object.entries(aiRecommendation.recommendations).forEach(([key, newPrice]) => {
        const [roomTypeId, dateStr] = key.split('_');
        setPriceForRoomTypeOnDate(roomTypeId, new Date(dateStr), newPrice);
    });

    toast({
        title: "Амжилттай",
        description: "AI-ийн санал болгосон үнээр амжилттай шинэчиллээ.",
    });

    setAiRecommendation(null);
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
    <>
    <div className="flex justify-end mb-4">
        <AlertDialog open={!!aiRecommendation} onOpenChange={(open) => !open && setAiRecommendation(null)}>
            <AlertDialogTrigger asChild>
                <Button onClick={handleAiPriceSuggest} disabled={isAiLoading}>
                    {isAiLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            AI үнэ боловсруулж байна...
                        </>
                    ) : (
                        <>
                            <BrainCircuit className="mr-2 h-4 w-4" />
                            AI Үнийн Зөвлөмж
                        </>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>AI Үнийн Зөвлөмж</AlertDialogTitle>
                <AlertDialogDescription>
                    {aiRecommendation?.summary || "Хиймэл оюун ухаан нь эрэлт, улирал, онцгой өдрүүдийг харгалзан таны өрөөнүүдийн үнийг дараах байдлаар оновчлохыг санал болгож байна."}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="max-h-60 overflow-y-auto text-sm space-y-2">
                    {aiRecommendation?.recommendations && Object.entries(aiRecommendation.recommendations).map(([key, newPrice]) => {
                        const [roomTypeId, dateStr] = key.split('_');
                        const room = ownerRoomTypes.find(r => r.id === roomTypeId);
                        if (!room) return null;
                        const oldPrice = getPriceForRoomTypeOnDate(roomTypeId, new Date(dateStr));
                        return (
                            <div key={key} className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                                <div>
                                    <p className="font-semibold">{room.roomName} - <span className="font-normal">{format(new Date(dateStr), 'M/dd')}</span></p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className="text-muted-foreground line-through">{oldPrice.toLocaleString()}₮</span>
                                     <span className="font-bold text-primary">{newPrice.toLocaleString()}₮</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <AlertDialogFooter>
                <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                <AlertDialogAction onClick={handleAcceptAiRecommendation}>Зөвшөөрөх</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
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
    </>
  );
}

    