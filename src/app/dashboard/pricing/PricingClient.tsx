
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
import { getPricingRecommendation } from "@/ai/flows/pricing-recommendation-flow";
import { PricingRecommendation, PricingRecommendationInput } from "@/ai/flows/pricing-recommendation.schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CompetitorPriceChart from "./CompetitorPriceChart";
import OccupancyForecastChart from "./OccupancyForecastChart";


export default function PricingClient() {
  const { userEmail, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { rooms, status: roomStatus, getPriceForRoomTypeOnDate, setPriceForRoomTypeOnDate } = useRoom();
  const router = useRouter();

  const [editingCell, setEditingCell] = useState<string | null>(null); // "roomTypeId-date"
  const [editingValue, setEditingValue] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<PricingRecommendation | null>(null);
  const [selectedRoomForChart, setSelectedRoomForChart] = useState<Room | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isAuthLoading, router]);

  const ownerRoomTypes = useMemo(() => {
    return rooms.filter(r => r.ownerId === userEmail);
  }, [rooms, userEmail]);
  
   useEffect(() => {
    if (!selectedRoomForChart && ownerRoomTypes.length > 0) {
      setSelectedRoomForChart(ownerRoomTypes[0]);
    }
  }, [ownerRoomTypes, selectedRoomForChart]);

  const dateColumns = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => addDays(today, i));
  }, []);

  const handleCellClick = (room: Room, date: Date) => {
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
      setPriceForRoomTypeOnDate(roomTypeId, new Date(dateStr), undefined);
      setEditingCell(null);
      setEditingValue("");
  }

  const handleAiPriceSuggest = async () => {
    setIsAiLoading(true);
    setAiRecommendation(null);
    
    // MOCK IMPLEMENTATION
    setTimeout(() => {
        if (ownerRoomTypes.length === 0) {
             toast({
                title: "Өрөө олдсонгүй",
                description: "AI зөвлөмж гаргахын тулд танд дор хаяж нэг өрөөний төрөл байх шаардлагатай.",
            });
            setIsAiLoading(false);
            return;
        }

        const recommendations: Record<string, number> = {};
        const firstRoomType = ownerRoomTypes[0];

        dateColumns.forEach(date => {
            const day = getDay(date); // Sunday: 0, Monday: 1, ..., Saturday: 6
            const dateStr = format(date, 'yyyy-MM-dd');
            const key = `${firstRoomType.id}_${dateStr}`;
            let newPrice: number | null = null;
            
            // Friday or Saturday: Increase by 15%
            if (day === 5 || day === 6) {
                newPrice = Math.round((firstRoomType.price * 1.15) / 1000) * 1000;
            }
            // Monday: Decrease by 10%
            else if (day === 1) {
                 newPrice = Math.round((firstRoomType.price * 0.9) / 1000) * 1000;
            }

            if (newPrice && newPrice !== firstRoomType.price) {
                recommendations[key] = newPrice;
            }
        });
        
        const mockRecommendation: PricingRecommendation = {
            summary: "Амралтын өдрүүдэд эрэлт ихсэх тул үнийг нэмж, ажлын өдрүүдэд хямдруулав.",
            recommendations: recommendations
        };

        if (Object.keys(mockRecommendation.recommendations).length === 0) {
            toast({
                title: "Өөрчлөлт санал болгосонгүй",
                description: "AI одоогийн үнийг хамгийн оновчтой гэж үзэж байна.",
            });
        } else {
            setAiRecommendation(mockRecommendation);
        }
        setIsAiLoading(false);

    }, 1500);
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
    <div className="space-y-8">
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
                <div className="border rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold text-foreground min-w-[200px] sticky left-0 bg-card z-10">Өрөөний төрөл</TableHead>
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
                                <TableRow 
                                    key={room.id}
                                    onClick={() => setSelectedRoomForChart(room)}
                                    className={cn(
                                        "cursor-pointer",
                                        selectedRoomForChart?.id === room.id && 'bg-muted/50'
                                    )}
                                >
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
                                                className={cn("text-center", isWeekend && "bg-muted/50", selectedRoomForChart?.id === room.id && 'bg-muted/50')}
                                                onClick={(e) => { e.stopPropagation(); handleCellClick(room, date)}}
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
                                                                onClick={(e) => {e.stopPropagation(); handleResetPrice()}}
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {selectedRoomForChart && <CompetitorPriceChart selectedRoom={selectedRoomForChart} />}
            <OccupancyForecastChart />
        </div>
    </div>
  );
}

    