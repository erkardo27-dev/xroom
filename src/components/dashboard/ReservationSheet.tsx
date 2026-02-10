"use client";

import { useMemo, useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { mn } from "date-fns/locale";
import { RoomInstance, RoomStatus, Reservation } from "@/lib/data";
import { reservationService } from "@/services/reservationService";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, User, Phone, Wallet, XCircle, CheckCircle, PlusCircle, Wrench, Lock, LogOut } from "lucide-react";
import { useRoom } from "@/context/RoomContext";
import { useToast } from "@/hooks/use-toast";

type ReservationSheetProps = {
    isOpen: boolean;
    onClose: () => void;
    selectedDate?: Date;
    selectedInstance?: RoomInstance;
};

export default function ReservationSheet({
    isOpen,
    onClose,
    selectedDate,
    selectedInstance,
}: ReservationSheetProps) {
    const { getRoomStatusForDate, setRoomStatusForDate } = useRoom();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [reservationData, setReservationData] = useState<Reservation | null>(null);

    // Form state for new reservation
    const [newResGuest, setNewResGuest] = useState("");
    const [newResPhone, setNewResPhone] = useState("");
    const [newResPrice, setNewResPrice] = useState<number>(0);

    const details = useMemo(() => {
        if (!selectedDate || !selectedInstance) return null;

        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        const dayData = selectedInstance.overrides?.[dateKey];
        const status = dayData?.status || selectedInstance.status;
        const bookingCode = dayData?.bookingCode || selectedInstance.bookingCode;

        const isBooked = status === 'booked' || status === 'occupied';

        return {
            status,
            dateKey,
            bookingCode,
            isBooked,
            price: dayData?.price || "Стандарт үнэ",
        };
    }, [selectedDate, selectedInstance]);

    // Fetch reservation details when opening a booked cell
    useEffect(() => {
        if (isOpen && details?.bookingCode && details.isBooked) {
            // Only fetch if it looks like a real code (starts with RES-)
            if (details.bookingCode.startsWith('RES-')) {
                setIsLoading(true);
                reservationService.getReservationByCode(details.bookingCode)
                    .then(res => {
                        setReservationData(res);
                    })
                    .catch(err => console.error("Failed to fetch reservation:", err))
                    .finally(() => setIsLoading(false));
            } else {
                setReservationData(null); // Manual booking/Legacy
            }
        } else {
            setReservationData(null);
            setNewResGuest("");
            setNewResPhone("");
            setNewResPrice(selectedInstance ? (selectedInstance.overrides?.[format(selectedDate!, 'yyyy-MM-dd')]?.price || 0) : 0);
        }
    }, [isOpen, details?.bookingCode, details?.isBooked, selectedDate, selectedInstance]); // eslint-disable-line react-hooks/exhaustive-deps


    const handleCreateReservation = async () => {
        if (!selectedInstance || !selectedDate) return;
        if (!newResGuest || !newResPhone) {
            toast({ title: "Дутуу мэдээлэл", description: "Зочны нэр болон утсыг оруулна уу.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            // Default to 1 night for now
            const checkOut = addDays(selectedDate, 1);

            await reservationService.createReservation({
                roomTypeId: selectedInstance.roomTypeId,
                roomInstanceId: selectedInstance.instanceId,
                status: 'booked',
                guestName: newResGuest,
                guestPhone: newResPhone,
                guestCount: 1,
                checkInDate: selectedDate,
                checkOutDate: checkOut,
                nights: 1,
                totalPrice: newResPrice,
                depositAmount: 0,
                currency: 'MNT',
                paymentStatus: 'pending',
                source: 'manual',
            }, selectedInstance);

            toast({ title: "Амжилттай", description: "Захиалга үүсгэгдлээ." });
            onClose();
            // We might need to refresh room instances here, but they are realtime via onSnapshot in RoomContext!
        } catch (error: any) {
            console.error(error);
            toast({ title: "Алдаа", description: "Захиалга үүсгэж чадсангүй.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = (newStatus: RoomStatus) => {
        if (!selectedInstance || !selectedDate) return;

        // For cleaning/resetting (making available), we clear the booking code
        const newBookingCode = newStatus === 'available' ? undefined : (details?.bookingCode);

        setRoomStatusForDate(selectedInstance.instanceId, selectedDate, newStatus, newBookingCode);

        toast({
            title: "Төлөв шинэчлэгдлээ",
            description: `Өрөөний төлөв: ${newStatus}`,
        });
        onClose();
    };

    if (!selectedDate || !selectedInstance || !details) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        Өрөө {selectedInstance.roomNumber}
                        <Badge variant={details.status === 'available' ? 'outline' : 'default'} className={
                            details.status === 'booked' ? "bg-blue-500" :
                                details.status === 'occupied' ? "bg-green-500" :
                                    details.status === 'maintenance' ? "bg-orange-500" :
                                        details.status === 'available' ? "text-green-600 border-green-600" : "bg-gray-500"
                        }>
                            {details.status === 'booked' ? 'Захиалгатай' :
                                details.status === 'occupied' ? 'Орсон' :
                                    details.status === 'maintenance' ? 'Засвартай' :
                                        details.status === 'available' ? 'Боломжтой' : 'Хаалттай'}
                        </Badge>
                    </SheetTitle>
                    <SheetDescription>
                        {format(selectedDate, 'yyyy оны M-р сарын d, EEEE', { locale: mn })}
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-4 py-6">
                    {details.isBooked ? (
                        // Booking Details View
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-4 text-muted-foreground">Уншиж байна...</div>
                            ) : (
                                <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Зочны нэр</p>
                                            <p className="text-sm text-muted-foreground">{reservationData?.guestName || "Тодорхойгүй"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Утас</p>
                                            <p className="text-sm text-muted-foreground">{reservationData?.guestPhone || "Тодорхойгүй"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Wallet className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Төлбөр</p>
                                            <p className="text-sm text-muted-foreground">{details.price}₮ ({reservationData?.paymentStatus || 'unknown'})</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Захиалгын код</p>
                                            <p className="text-sm font-mono text-muted-foreground">{details.bookingCode || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                {details.status === 'booked' && (
                                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleAction('occupied')}>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Check-in
                                    </Button>
                                )}
                                {details.status === 'occupied' && (
                                    <Button className="w-full" variant="outline" onClick={() => handleAction('available')}>
                                        <LogOut className="mr-2 h-4 w-4" /> Check-out
                                    </Button>
                                )}
                                <Button variant="destructive" className="w-full" onClick={() => handleAction('available')}>
                                    <XCircle className="mr-2 h-4 w-4" /> Цуцлах
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Available / Create Reservation View
                        <div className="space-y-4">
                            <div className="space-y-4 border p-4 rounded-md">
                                <h3 className="font-medium">Шинэ захиалга үүсгэх</h3>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Зочны нэр</label>
                                    <input
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newResGuest}
                                        onChange={(e) => setNewResGuest(e.target.value)}
                                        placeholder="Бат-Эрдэнэ"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Утас</label>
                                    <input
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newResPhone}
                                        onChange={(e) => setNewResPhone(e.target.value)}
                                        placeholder="9911..."
                                    />
                                </div>
                                <Button className="w-full" onClick={handleCreateReservation} disabled={isLoading}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    {isLoading ? "Үүсгэж байна..." : "Захиалга үүсгэх"}
                                </Button>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Эсвэл</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                <Button className="w-full justify-start" variant="outline" onClick={() => handleAction('maintenance')}>
                                    <Wrench className="mr-2 h-4 w-4" /> Засвартай болгох (Block)
                                </Button>
                                <Button className="w-full justify-start" variant="outline" onClick={() => handleAction('closed')}>
                                    <Lock className="mr-2 h-4 w-4" /> Хаах (Close)
                                </Button>
                                {details.status !== 'available' && (
                                    <Button className="w-full justify-start" variant="outline" onClick={() => handleAction('available')}>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Нээх (Make Available)
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <SheetFooter>
                    {/* Additional footer actions if needed */}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}


