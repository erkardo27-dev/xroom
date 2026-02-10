

"use client";

import Image from 'next/image';
import type { Amenity } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Wifi, ParkingSquare, UtensilsCrossed, Loader2, BedDouble, HelpCircle, Zap, Info, Tv2, Coffee, Bath, Dumbbell, WashingMachine, Mic, Hand, Phone, AlertTriangle, Flame, Banknote, Building2, KeyRound, Check } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRoom } from '@/context/RoomContext';
import { useToast } from '@/hooks/use-toast';
import { format, startOfDay, addDays, differenceInDays } from 'date-fns';
import { Separator } from '../ui/separator';
import { amenityOptions, Room, RoomInstance } from '@/lib/data';
import { logActivity } from '@/lib/audit';
import Autoplay from "embla-carousel-autoplay"
import { useAuth } from '@/context/AuthContext';


const amenityIcons: { [key: string]: React.ReactNode } = {
  wifi: <Wifi className="w-4 h-4" />,
  parking: <ParkingSquare className="w-4 h-4" />,
  restaurant: <UtensilsCrossed className="w-4 h-4" />,
  unifi: <Tv2 className="w-4 h-4" />,
  breakfast: <Coffee className="w-4 h-4" />,
  bathtub: <Bath className="w-4 h-4" />,
  fitness: <Dumbbell className="w-4 h-4" />,
  laundry: <WashingMachine className="w-4 h-4" />,
  karaoke: <Mic className="w-4 h-4" />,
  massage: <Hand className="w-4 h-4" />,
};

type BookingStep = 'details' | 'payment' | 'processing' | 'success';
type PaymentMethod = 'qpay' | 'socialpay' | 'transfer';
const SERVICE_FEE = 5000;

const QPayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM11.1664 6.88339C10.741 6.64391 10.2319 6.83296 10.0152 7.27988C9.91436 7.47881 9.87034 7.71261 9.90169 7.94056L10.5181 12.3338C10.5739 12.7565 10.9254 13.0694 11.3468 13.0694H12.6521C13.2543 13.0694 13.7383 12.5854 13.7383 11.9832C13.7383 11.381 13.2543 10.897 12.6521 10.897H11.7583L12.0166 9.07174C12.0537 8.7997 11.8398 8.56022 11.5678 8.52309C11.5259 8.51741 11.4834 8.51741 11.4415 8.52309L10.3621 8.68114C10.0901 8.71827 9.87614 8.95775 9.83901 9.22971C9.80188 9.50166 10.0158 9.74114 10.2878 9.77827L10.9252 9.67498L10.5843 12.0832L11.3468 12.0832C11.6677 12.0832 11.9251 11.8257 11.9251 11.5048C11.9251 11.1839 11.6677 10.9265 11.3468 10.9265H10.7473L11.1664 6.88339ZM8.24391 10.88C8.61803 10.5529 9.17637 10.518 9.58579 10.7937L12.9818 13.2268C13.3855 13.5025 13.6896 13.9169 13.7372 14.3941L14.0747 17.6625C14.128 18.1906 13.7243 18.6439 13.1962 18.6972C12.6681 18.7505 12.2148 18.3468 12.1615 17.8187L11.866 14.938L9.04944 16.7932C8.64861 17.0688 8.14812 17.027 7.78822 16.6671C7.42832 16.3072 7.38655 15.8067 7.66223 15.4059L8.24391 10.88Z" fill="#00AEEF" />
  </svg>
);

const SocialPayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="24" cy="24" r="24" fill="#7E469C" />
    <path d="M24.0013 32.32C28.5833 32.32 32.3213 28.582 32.3213 24C32.3213 19.418 28.5833 15.68 24.0013 15.68C19.4193 15.68 15.6813 19.418 15.6813 24C15.6813 28.582 19.4193 32.32 24.0013 32.32Z" stroke="white" strokeWidth="3.2" strokeMiterlimit="10" strokeLinecap="round" />
    <path d="M24 28.2C26.3152 28.2 28.2 26.3152 28.2 24C28.2 21.6848 26.3152 19.8 24 19.8C21.6848 19.8 19.8 21.6848 19.8 24C19.8 26.3152 21.6848 28.2 24 28.2Z" fill="white" />
  </svg>
);

const TransferIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M17 10H3V12H17V10ZM21 6H3V8H21V6ZM13 14H3V16H13V14ZM21 18H3V20H21V18Z" fill="currentColor" />
  </svg>
);

type RoomCardProps = {
  room: Room;
  availableInstances: RoomInstance[];
};

function BookingCarousel({ room, images, isBookingOpen }: { room: Room, images: any[], isBookingOpen: boolean }) {
  const [api, setApi] = useState<CarouselApi>()
  const autoplay = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true })
  )

  useEffect(() => {
    if (isBookingOpen && api) {
      // A short delay is needed to allow the dialog to finish its animation
      setTimeout(() => {
        api.reInit();
      }, 100);
    }
  }, [isBookingOpen, api]);

  return (
    <Carousel
      setApi={setApi}
      className="relative w-full rounded-t-lg overflow-hidden"
      plugins={[autoplay.current]}
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {(images.length > 0 ? images : [PlaceHolderImages[0]]).map((image, index) => (
          <CarouselItem key={image.id || index}>
            <div className="relative h-48 w-full">
              <Image
                src={image.imageUrl}
                alt={image.description}
                data-ai-hint={image.imageHint}
                width={800}
                height={600}
                className="object-cover w-full h-full"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/50 hover:bg-background/80 border-none" />
      <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/50 hover:bg-background/80 border-none" />
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent' />
    </Carousel>
  );
}


export function RoomCard({ room, availableInstances }: RoomCardProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<BookingStep>('details');
  const [checkinCode, setCheckinCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>('qpay');

  const { setRoomStatusForDate, toggleLike, likedRooms, selectedDateRange, calculateTotalPrice, calculateTotalDeposit, isRoomAvailableInRange } = useRoom();
  const { hotelInfo } = useAuth();
  const { toast } = useToast();
  const initialFocusRef = useRef<HTMLInputElement>(null);

  // Filter available instances based on the selected date range
  const availableInstancesInRange = useMemo(() => {
    return availableInstances.filter(instance =>
      isRoomAvailableInRange(instance.instanceId, selectedDateRange.from, selectedDateRange.to)
    );
  }, [availableInstances, isRoomAvailableInRange, selectedDateRange]);

  const availableCount = availableInstancesInRange.length;
  const isSoldOut = availableCount === 0;


  const nights = differenceInDays(selectedDateRange.to, selectedDateRange.from) || 1;
  const roomPriceTotal = calculateTotalPrice(room.id, selectedDateRange.from, selectedDateRange.to);
  const totalPrice = roomPriceTotal + SERVICE_FEE;

  // Calculate dynamic deposit
  // If calculateTotalDeposit returns > 0, we use it. 
  // If it's a mix or complex, we trust the sum.
  // HOWEVER, we need to handle the "Default Hotel Percentage" case.
  // Our calculateTotalDeposit in RoomContext returns 0 if error, but inside it calls getRoomDepositForDate which returns -1 for defaults.
  // We need to fetch the deposit parts manually here or update calculateTotalDeposit to take the default percentage as arg.
  // Let's go with manual calculation here to be safe and explicit, mirroring calculateTotalPrice logic but with deposit handling.

  const totalDepositRequired = useMemo(() => {
    let total = 0;
    const days = differenceInDays(selectedDateRange.to, selectedDateRange.from) || 1;
    let current = startOfDay(selectedDateRange.from);
    // We need to access instance to get specific overrides.
    // In RoomCard we have "room" (type). We need "any available instance" logic or just "room type logic"?
    // Pricing is per Room Type generally, but overrides are on Instances.
    // But wait, our PricingClient sets overrides on ALL instances of a room type usually? 
    // Actually RoomContext's setPriceForRoomTypeOnDate updates ALL instances.
    // So picking the first available instance is a safe approximation for "Room Type Price".
    const instance = availableInstances[0] || { instanceId: 'dummy', overrides: {} }; // Fallback if sold out, just to calculate price?

    // If sold out, we might not have an instance to check overrides against if we only passed availableInstances.
    // But RoomCard props say "availableInstances". 
    // precise calculation needs *an* instance. 
    // If no instances available, we can't really book, so price/deposit matters less, but showing it is good.
    // Let's assume consistent pricing across instances for now (since we bulk update).

    for (let i = 0; i < days; i++) {
      const date = addDays(current, i);
      const dateKey = format(date, 'yyyy-MM-dd');

      // 1. Get Price for this day
      // We can use calculateTotalPrice but that returns sum.
      // Let's rely on RoomContext helper if possible, but we need per-day breakdown for deposit.
      // Actually, let's just use the `calculateTotalDeposit` from context, BUT we need to pass the default % in?
      // No, context doesn't know about `hotelInfo`.
      // Let's do it here.

      // Get Instance Override or Default
      let dayDepositPct = hotelInfo?.depositPercentage ?? 100;

      // Try to find override
      // We need an instance to check overrides.
      // If room is sold out, we have 0 instances. We can't check overrides.
      // This is a known limitation if we don't pass allInstances to RoomCard.
      // But RoomCard is for "Available" rooms usually.

      if (availableInstances.length > 0) {
        const inst = availableInstances[0];
        if (inst.overrides?.[dateKey]?.depositPercentage !== undefined) {
          dayDepositPct = inst.overrides[dateKey].depositPercentage!;
        }
      }

      // Get Price for this day (approximation using total / days? No, prices vary)
      // We really need `getRoomPriceForDate` exposed or assume implicit.
      // Let's assume `roomPriceTotal` is correct, but we need per-day for exact percentage math?
      // Actually `fraction * price` is fine.
      // But we can't easily get daily price here without a helper.
      // Let's update `RoomContext` to expose `getRoomPriceForDate`? It IS exposed.
      // But we need an instance ID.

      // New Strategy:
      // 1. Calculate Total Deposit based on the first available instance (or default if none).
    }
    return 0;
  }, [availableInstances, hotelInfo, selectedDateRange, room.id]);

  // REVISED STRATEGY:
  // We will iterate days. For each day, get price (using context) and get deposit % (using context + fallback).

  const depositCalculation = useMemo(() => {
    let depTotal = 0;
    const startDate = startOfDay(selectedDateRange.from);
    const endDate = addDays(selectedDateRange.to, -1);
    let current = startDate;

    const instance = availableInstances.length > 0 ? availableInstances[0] : null;

    // If no instance, valid calculation is impossible if overrides exist. 
    // Fallback to: TotalPrice * DefaultPct
    if (!instance) {
      const defaultPct = hotelInfo?.depositPercentage ?? 100;
      return Math.round(totalPrice * (defaultPct / 100));
    }

    while (current <= endDate) {
      const dayPrice = calculateTotalPrice(room.id, current, addDays(current, 1)); // Single day price

      let dayPct = hotelInfo?.depositPercentage ?? 100;
      const dateKey = format(current, 'yyyy-MM-dd');

      if (instance.overrides?.[dateKey]?.depositPercentage !== undefined) {
        dayPct = instance.overrides[dateKey].depositPercentage!;
      }

      depTotal += (dayPrice * dayPct) / 100;
      current = addDays(current, 1);
    }

    // Add service fee to deposit? Usually service fee is paid upfront.
    // Let's assume Service Fee is ALWAYS paid upfront (100% deposit on fee).
    depTotal += SERVICE_FEE;

    return Math.round(depTotal);
  }, [availableInstances, hotelInfo, selectedDateRange, room.id, calculateTotalPrice, totalPrice]);

  const depositAmount = depositCalculation;
  const payOnArrivalAmount = totalPrice - depositAmount;

  // Calculate an "Effective Percentage" for display purposes
  const effectiveDepositPercentage = totalPrice > 0 ? Math.round((depositAmount / totalPrice) * 100) : 0;

  const isLiked = likedRooms.includes(room.id);

  useEffect(() => {
    if (isBookingOpen && bookingStep === 'details') {
      setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 100);
    }
  }, [isBookingOpen, bookingStep]);


  const images = useMemo(() =>
    room.imageUrls.map(url => ({
      id: url,
      imageUrl: url,
      description: 'Hotel image',
      imageHint: ''
    })),
    [room.imageUrls]
  );

  const discount = room.originalPrice ? Math.round(((room.originalPrice - room.price) / room.originalPrice) * 100) : 0;


  const handleBookNow = () => {
    if (isSoldOut) {
      toast({
        variant: "destructive",
        title: "Уучлаарай, өрөө дууссан байна",
        description: "Энэ төрлийн бүх өрөө захиалагдсан байна.",
      });
      return;
    }
    setIsBookingOpen(true);
  };

  const handleProceedToPayment = () => {
    setBookingStep('payment');
  }

  const handleConfirmPayment = () => {
    if (isSoldOut || !paymentMethod) return;

    setBookingStep('processing');

    setTimeout(() => {
      const instanceToBook = availableInstancesInRange[0];
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();

      const startDate = startOfDay(selectedDateRange.from);
      const endDate = startOfDay(addDays(selectedDateRange.to, -1));
      let currentDate = startDate;

      while (currentDate <= endDate) {
        setRoomStatusForDate(
          instanceToBook.instanceId,
          currentDate,
          'booked',
          newCode
        );
        currentDate = addDays(currentDate, 1);
      }

      setCheckinCode(newCode);
      setBookingStep('success');
      logActivity(
        room.ownerId,
        'booking_created',
        `${room.hotelName} - ${room.roomName} өрөөнд шинэ захиалга хийгдлээ. Код: ${newCode}. Хугацаа: ${format(selectedDateRange.from, 'MM/dd')} - ${format(selectedDateRange.to, 'MM/dd')} (${nights} хоног). Төлсөн: ${depositAmount.toLocaleString()}₮`,
        { roomTypeId: room.id, price: depositAmount, total_price: totalPrice, nights: nights }
      );
    }, 1500);
  };

  const closeAndResetDialog = () => {
    setIsBookingOpen(false);
    setTimeout(() => {
      setBookingStep('details');
      setCheckinCode('');
      setTermsAccepted(false);
      setPaymentMethod('qpay');
    }, 300);
  }

  const amenities = useMemo(() =>
    amenityOptions.filter(opt => room.amenities.includes(opt.id)),
    [room.amenities]);

  const isDetailsConfirmationDisabled = checkinCode.length !== 4 || !termsAccepted;

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(room.id);
  }

  const UrgencyMessage = () => {
    if (isSoldOut || availableCount > 5) return null;
    if (availableCount === 1) {
      return (
        <p className="text-sm font-semibold text-destructive flex items-center gap-1.5 mt-2">
          <Flame className="w-4 h-4" />
          Сүүлчийн өрөө!
        </p>
      )
    }
    return (
      <p className="text-sm font-semibold text-orange-600 flex items-center gap-1.5 mt-2">
        <Flame className="w-4 h-4" />
        Энэ үнээр зөвхөн <strong className='mx-1'>{availableCount}</strong> өрөө үлдлээ!
      </p>
    )
  }

  return (
    <>
      <Card className="overflow-hidden group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white dark:bg-zinc-900 h-full flex flex-col">
        <div className="relative h-64 overflow-hidden">
          <Carousel className="w-full h-full" opts={{ loop: true }}>
            <CarouselContent>
              {(images.length > 0 ? images : [PlaceHolderImages[0]]).map((image, index) => (
                <CarouselItem key={image.id || index} className="p-0">
                  <div className="relative h-64 w-full">
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      data-ai-hint={image.imageHint}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-white/20 hover:bg-white/40 border-none text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            <CarouselNext className="right-2 bg-white/20 hover:bg-white/40 border-none text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </Carousel>

          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-md bg-opacity-90">
              <Zap className="w-3 h-3 fill-white" />
              -{discount}%
            </div>
          )}

          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="bg-black/40 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
              <Heart className="w-3 h-3 fill-white" />
              {room.likes || 0}
            </div>
            <button
              onClick={handleLikeClick}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 border border-white/10",
                isLiked ? "bg-red-500/90 text-white" : "bg-black/30 text-white hover:bg-black/50"
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            </button>
          </div>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-1 text-xs font-medium text-white/90 mb-0.5">
              <Building2 className="w-3 h-3" />
              {room.hotelName}
            </div>
            <h3 className="font-bold text-xl leading-tight truncate drop-shadow-md">{room.roomName}</h3>
          </div>
        </div>

        <CardContent className="p-5 flex flex-col flex-1 relative">
          {/* Location Badge */}
          <div className="absolute -top-3 right-4 bg-white dark:bg-zinc-800 shadow-md border border-zinc-100 dark:border-zinc-700 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 z-10">
            <MapPin className="w-3 h-3 text-primary" />
            {room.distance.toFixed(1)} км
          </div>

          <div className="mt-2 space-y-4 flex-1">
            <UrgencyMessage />

            {/* Amenities */}
            <div className="flex flex-wrap gap-2">
              {Object.keys(amenityIcons).slice(0, 4).map(key => {
                const amenity = room.amenities.find(a => a === key);
                if (!amenity) return null;
                return (
                  <div key={key} className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400" title={amenity}>
                    {amenityIcons[amenity]}
                  </div>
                )
              })}
              {room.amenities.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  +{room.amenities.length - 4}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="flex items-end justify-between">
              <div>
                {room.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through block">
                    {room.originalPrice.toLocaleString()}₮
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-foreground tracking-tight">
                    {roomPriceTotal.toLocaleString()}₮
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    / {nights} шөнө
                  </span>
                </div>
              </div>

              <Button
                onClick={handleBookNow}
                className={cn(
                  "rounded-xl font-bold px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95",
                  isSoldOut ? "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 shadow-none cursor-not-allowed" : "bg-primary hover:bg-primary/90"
                )}
                disabled={isSoldOut}
              >
                {isSoldOut ? 'Дууссан' : 'Захиалах'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <React.Fragment key={room.id}>
        <AlertDialog open={isBookingOpen} onOpenChange={(open) => !open && closeAndResetDialog()}>
          <AlertDialogContent>
            {bookingStep === 'details' && (
              <>
                <AlertDialogHeader className='-m-6 mb-0'>
                  <BookingCarousel room={room} images={images} isBookingOpen={isBookingOpen} />
                  <div className='absolute bottom-4 left-4 text-white p-6'>
                    <AlertDialogTitle className='text-xl'>{room.hotelName}</AlertDialogTitle>
                    <AlertDialogDescription className='text-white/90'>{room.roomName}</AlertDialogDescription>
                  </div>
                </AlertDialogHeader>

                <div className="space-y-4 pt-4">
                  <div className='bg-muted/50 rounded-xl p-4 space-y-3 border'>
                    <div className='flex justify-between items-center text-sm font-semibold'>
                      <p className='flex items-center gap-2'><Building2 className='w-4 h-4' />Буудлын хаяг</p>
                    </div>
                    <Separator />
                    <p className='text-sm text-muted-foreground'>{room.detailedAddress || 'Дэлгэрэнгүй хаяг оруулаагүй байна.'}</p>

                    <div className="pt-2">
                      <p className="font-semibold text-sm">Өрөөний үйлчилгээ</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                        {amenities.map(amenity => (
                          <div key={amenity.id} className="flex items-center gap-2">
                            {amenityIcons[amenity.id]}
                            <span>{amenity.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='bg-muted/50 rounded-xl p-4 space-y-3 border'>
                    <div className='flex justify-between text-sm'>
                      <p>Өрөөний үнэ ({nights} хоног)</p>
                      <p className='font-medium'>{roomPriceTotal.toLocaleString()}₮</p>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <p className='flex items-center gap-1.5 text-muted-foreground'>
                        Үйлчилгээний шимтгэл
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3.5 h-3.5" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Аппликейшний найдвартай, тасралтгүй <br /> ажиллагааг хангахад зориулагдана.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </p>
                      <p className='font-medium text-muted-foreground'>{SERVICE_FEE.toLocaleString()}₮</p>
                    </div>
                    <Separator />
                    <div className='flex justify-between text-base'>
                      <p className='font-semibold'>Нийт дүн</p>
                      <p className='font-bold text-primary text-lg'>{totalPrice.toLocaleString()}₮</p>
                    </div>
                    {effectiveDepositPercentage < 100 && (
                      <>
                        <div className='flex justify-between text-sm pt-2 text-green-600 dark:text-green-400'>
                          <p className='font-medium'>Урьдчилгаа ({effectiveDepositPercentage}%)</p>
                          <p className='font-bold'>{depositAmount.toLocaleString()}₮</p>
                        </div>
                        <div className='flex justify-between text-sm text-muted-foreground'>
                          <p>Үлдэгдэл (Очоод төлөх)</p>
                          <p className='font-medium'>{payOnArrivalAmount.toLocaleString()}₮</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
                    <div className='flex items-center gap-3'>
                      <KeyRound className="w-6 h-6 text-primary" />
                      <div>
                        <Label htmlFor="checkin-code" className="text-base font-bold text-primary">
                          Таны нууц код
                        </Label>
                        <p className='text-xs text-muted-foreground'>Буудалд өрөөгөө хүлээн авахдаа энэ 4 оронтой кодыг ашиглана.</p>
                      </div>
                    </div>
                    <Input
                      id="checkin-code"
                      ref={initialFocusRef}
                      placeholder="••••"
                      maxLength={4}
                      value={checkinCode}
                      onChange={(e) => setCheckinCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="text-center text-3xl tracking-[0.5em] font-mono h-14 bg-background"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
                    <Label htmlFor="terms" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Би <a href="#" className="underline text-primary">үйлчилгээний нөхцөлийг</a> зөвшөөрч байна.
                    </Label>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={closeAndResetDialog}>Цуцлах</AlertDialogCancel>
                  <Button onClick={handleProceedToPayment} disabled={isDetailsConfirmationDisabled} className="shadow-md shadow-primary/40">
                    Төлбөр төлөх
                  </Button>
                </AlertDialogFooter>
              </>
            )}
            {bookingStep === 'payment' && (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle>Төлбөрийн хэрэгсэл сонгох</AlertDialogTitle>
                  <AlertDialogDescription>
                    Та доорх хэрэгслүүдээс сонгон төлбөрөө төлнө үү.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-6 pt-2">
                  <div className='text-center space-y-1'>
                    <p className="text-sm text-muted-foreground">Төлөх дүн {effectiveDepositPercentage < 100 && "(Урьдчилгаа)"}</p>
                    <p className="text-4xl font-bold text-primary">{depositAmount.toLocaleString()}₮</p>
                    {effectiveDepositPercentage < 100 && (
                      <p className="text-xs text-muted-foreground">Үлдэгдэл {payOnArrivalAmount.toLocaleString()}₮-ийг буудалд төлнө.</p>
                    )}
                  </div>
                  <div className="flex justify-center gap-4">
                    <button onClick={() => setPaymentMethod('qpay')} className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 w-24 h-24 transition-all", paymentMethod === 'qpay' ? 'border-primary shadow-lg scale-105' : 'border-muted hover:border-primary/50')}>
                      <QPayIcon className="h-8 w-8" />
                      <span className="mt-2 text-sm font-medium">QPay</span>
                    </button>
                    <button onClick={() => setPaymentMethod('socialpay')} className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 w-24 h-24 transition-all", paymentMethod === 'socialpay' ? 'border-primary shadow-lg scale-105' : 'border-muted hover:border-primary/50')}>
                      <SocialPayIcon className="h-8 w-8" />
                      <span className="mt-2 text-sm font-medium">SocialPay</span>
                    </button>
                    <button onClick={() => setPaymentMethod('transfer')} className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 w-24 h-24 transition-all", paymentMethod === 'transfer' ? 'border-primary shadow-lg scale-105' : 'border-muted hover:border-primary/50')}>
                      <Banknote className="h-8 w-8" />
                      <span className="mt-2 text-sm font-medium">Дансаар</span>
                    </button>
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setBookingStep('details')}>Буцах</AlertDialogCancel>
                  <Button onClick={handleConfirmPayment} disabled={!paymentMethod} className="shadow-md shadow-primary/40">
                    Төлбөр шалгах
                  </Button>
                </AlertDialogFooter>
              </>
            )}
            {bookingStep === 'processing' && (
              <div className="flex flex-col items-center justify-center text-center py-8 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <AlertDialogTitle>Төлбөрийг боловсруулж байна...</AlertDialogTitle>
                <AlertDialogDescription>
                  Таны захиалгыг баталгаажуулж байна, түр хүлээнэ үү.
                </AlertDialogDescription>
              </div>
            )}
            {bookingStep === 'success' && (
              <>
                <AlertDialogHeader className="text-center items-center">
                  <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center border-4 border-green-200">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <AlertDialogTitle className="pt-2">Захиалга баталгаажлаа!</AlertDialogTitle>
                  <AlertDialogDescription>
                    Та доорх мэдээллийг ашиглан буудалд нэвтэрнэ үү.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col text-center py-4 gap-4">
                  <div className="text-sm text-muted-foreground text-left bg-secondary/50 p-4 rounded-lg space-y-3">
                    <div className='flex justify-between items-start'>
                      <div>
                        <p className='font-semibold text-foreground'>{room.hotelName}</p>
                        <p className='flex items-center gap-2'><MapPin className='w-3.5 h-3.5' />{room.location}</p>
                      </div>
                      <p className='flex items-center gap-2'><Phone className='w-3.5 h-3.5' /> {room.phoneNumber}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className='font-semibold text-foreground uppercase'>Таны нэвтрэх код</p>
                      <p className="font-bold text-primary tracking-[0.3em] text-4xl bg-background/50 py-2 mt-1 rounded-md">{checkinCode}</p>
                    </div>
                  </div>

                  <Alert variant="destructive" className='mt-4 text-left bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800/30'>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertTitle className='text-yellow-700 dark:text-yellow-400 font-bold'>Чухал санамж</AlertTitle>
                    <AlertDescription className='text-yellow-600 dark:text-yellow-500'>
                      Энэ цонхыг хаасны дараа нэвтрэх код дахин харагдахгүй. Та мэдээллээ тэмдэглэж авна уу.
                    </AlertDescription>
                  </Alert>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-green-500/30 hover:bg-green-50 text-green-700 dark:text-green-400"
                    onClick={() => {
                      const text = `XRoom Tonight Захиалга: \nБуудал: ${room.hotelName}\nӨрөө: ${room.roomName}\nКод: ${checkinCode}\nХаяг: ${room.location}, ${room.detailedAddress || ''}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-blue-500/30 hover:bg-blue-50 text-blue-700 dark:text-blue-400"
                    onClick={() => {
                      const text = `XRoom: ${room.hotelName}, Код: ${checkinCode}`;
                      window.open(`sms:?&body=${encodeURIComponent(text)}`, '_blank');
                    }}
                  >
                    <Mic className="w-4 h-4" />
                    SMS илгээх
                  </Button>
                </div>

                <AlertDialogFooter>
                  <AlertDialogAction onClick={closeAndResetDialog} className="w-full">Ойлголоо</AlertDialogAction>
                </AlertDialogFooter>
              </>
            )}
          </AlertDialogContent>
        </AlertDialog>
      </React.Fragment>
    </>
  );
}
