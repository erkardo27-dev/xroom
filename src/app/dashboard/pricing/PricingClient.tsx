
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
import { addDays, format, getDay } from "date-fns";
import { mn } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BrainCircuit, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { PricingRecommendation } from "@/ai/flows/pricing-recommendation-flow";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


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
    // Don't allow editing if there's an active AI recommendation
    if (aiRecommendation) return;

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
    const newPrice = editingValue.trim() === '' ? getPriceForRoomTypeOnDate(roomTypeId, new Date(dateStr)) : Number(editingValue);

    if (!isNaN(newPrice)) {
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

  const handleResetPrice = () => {
      if (!editingCell) return;
      const [roomTypeId, dateStr] = editingCell.split('-');
      // Setting price to undefined reverts it to the base price
      setPriceForRoomTypeOnDate(roomTypeId, new Date(dateStr), undefined);
      setEditingCell(null);
      setEditingValue("");
  }

  const handleAiPriceSuggest = async () => {
    setIsAiLoading(true);
    setAiRecommendation(null); // Clear previous recommendations
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
                    if (newPrice !== currentPrice) {
                        const key = `${room.id}_${format(date, 'yyyy-MM-dd')}`;
                        mockRecommendations[key] = newPrice;
                    }
                }
            });
        });

        const recommendation: PricingRecommendation = {
            summary: "Ачаалал, улирлын байдлыг харгалзан амралтын өдрүүдэд үнийг нэмэгдүүлж, ажлын өдрүүдэд бага зэрэг хямдруулахыг санал болгож байна.",
            recommendations: mockRecommendations,
        };

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

  const handleCancelAiRecommendation = () => {
    setAiRecommendation(null);
  }

  const getPreviewPrice = (roomTypeId: string, date: Date): number | null => {
      if (!aiRecommendation) return null;
      const key = `${roomTypeId}_${format(date, 'yyyy-MM-dd')}`;
      return aiRecommendation.recommendations[key] || null;
  }


  const isLoading = isAuthLoading || roomStatus === 'loading';

  if (isLoading || !isLoggedIn) {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-5 w-1/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-12 w-full mb-2" />
                    {Array.from({length: 4}).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full mb-1" />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <Card>
        <CardHeader>
             <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <CardTitle>7 хоногийн үнийн төлөвлөгөө</CardTitle>
                    <CardDescription>Энд дарж үнээ өөрчлөөрэй. Хоосон орхивол үндсэн үнээр тооцогдоно.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    {aiRecommendation && (
                        <>
                            <Button variant="outline" onClick={handleCancelAiRecommendation}>Цуцлах</Button>
                            <Button onClick={handleAcceptAiRecommendation}>Зөвшөөрөх</Button>
                        </>
                    )}
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
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
             {aiRecommendation && (
                <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    <AlertTitle className="text-blue-900 dark:text-blue-300 font-semibold">AI Зөвлөмжийн Хураангуй</AlertTitle>
                    <AlertDescription className="text-blue-800/90 dark:text-blue-400/90">
                       {aiRecommendation.summary}
                    </AlertDescription>
                </Alert>
            )}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bold text-foreground min-w-[150px] sticky left-0 bg-card z-10">Өрөөний төрөл</TableHead>
                            {dateColumns.map(date => {
                                const day = getDay(date);
                                const isWeekend = day === 0 || day === 6;
                                return (
                                    <TableHead key={date.toString()} className={cn("text-center min-w-[120px]", isWeekend && "bg-muted/50")}>
                                        <div>{format(date, 'M/dd')}</div>
                                        <div className="text-xs font-normal text-muted-foreground">{format(date, 'EEE', {locale: mn})}</div>
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ownerRoomTypes.map(room => (
                            <TableRow key={room.id}>
                                <TableCell className="font-semibold sticky left-0 bg-card z-10">
                                    <div>{room.roomName}</div>
                                    <div className="text-xs text-muted-foreground font-normal">{room.price.toLocaleString()}₮</div>
                                </TableCell>
                                {dateColumns.map(date => {
                                    const day = getDay(date);
                                    const isWeekend = day === 0 || day === 6;
                                    const cellId = `${room.id}-${format(date, 'yyyy-MM-dd')}`;
                                    const isEditing = editingCell === cellId;

                                    const price = getPriceForRoomTypeOnDate(room.id, date);
                                    const isOverridden = price !== room.price;
                                    
                                    const previewPrice = getPreviewPrice(room.id, date);
                                    const isPreviewing = previewPrice !== null && previewPrice !== price;

                                    return (
                                        <TableCell 
                                            key={date.toString()} 
                                            className={cn("text-center cursor-pointer", isWeekend && "bg-muted/50")}
                                            onClick={() => handleCellClick(room, date)}
                                        >
                                            {isEditing ? (
                                                <div className="relative w-28 mx-auto">
                                                    <Input 
                                                        type="number"
                                                        value={editingValue}
                                                        onChange={handleInputChange}
                                                        onBlur={handleInputBlur}
                                                        onKeyDown={handleInputKeyDown}
                                                        autoFocus
                                                        className="w-full text-center font-semibold pr-7"
                                                    />
                                                    {isOverridden && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                                                            onClick={handleResetPrice}
                                                        >
                                                            <RotateCcw className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className={cn(
                                                    "font-semibold w-24 mx-auto p-2 rounded-md transition-colors duration-300",
                                                    isOverridden && !isPreviewing && "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400",
                                                    isPreviewing && "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 ring-2 ring-blue-400/50"
                                                )}>
                                                    {isPreviewing ? previewPrice?.toLocaleString() : price.toLocaleString()}₮
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
        </CardContent>
    </Card>
  );
}
