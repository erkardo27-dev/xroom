"use client";

import Image from 'next/image';
import type { Room } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Wifi, ParkingSquare, UtensilsCrossed, CheckCircle, Loader2, BedDouble, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
} from "@/components/ui/carousel"

import { useState, useMemo, useEffect, useRef } from 'react';

const amenityIcons: { [key: string]: React.ReactNode } = {
    wifi: <Wifi className="w-4 h-4" />,
    parking: <ParkingSquare className="w-4 h-4" />,
    restaurant: <UtensilsCrossed className="w-4 h-4" />,
};

type BookingStep = 'selection' | 'booking' | 'success';
type PaymentMethod = 'qpay' | 'socialpay' | 'transfer';

const QPayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-12h4v2h-4v-2zm0 4h4v2h-4v-2zm-2 2h8v2h-8v-2z" fill="currentColor"/>
    </svg>
);

const SocialPayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" />
        <path d="M15.5 12c0-1.93-1.57-3.5-3.5-3.5S8.5 10.07 8.5 12s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5zm-3.5 2c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="currentColor" />
    </svg>
);

const TransferIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M17 10H3v2h14v-2zm2-4H3v2h16V6zm-4 8H3v2h12v-2zM3 18v-2h18v2H3z" fill="currentColor"/>
    </svg>
);


export function RoomCard({ room }: { room: Room }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<BookingStep>('selection');
  const [confirmationId, setConfirmationId] = useState('');
  const [checkinCode, setCheckinCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  const initialFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isBookingOpen && bookingStep === 'selection') {
      setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 100);
    }
  }, [isBookingOpen, bookingStep]);

  const images = useMemo(() => 
    room.imageIds.map(id => PlaceHolderImages.find(img => img.id === id)).filter(Boolean) as typeof PlaceHolderImages, 
    [room.imageIds]
  );
  
  const discount = room.originalPrice ? Math.round(((room.originalPrice - room.price) / room.originalPrice) * 100) : 0;

  const handleBookNow = () => {
    setIsBookingOpen(true);
  };
  
  const handleConfirmBooking = () => {
    setBookingStep('booking');
    // Simulate API call for booking
    setTimeout(() => {
        setConfirmationId(`XR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
        setBookingStep('success');
    }, 1500);
  };

  const closeAndResetDialog = () => {
    setIsBookingOpen(false);
    setTimeout(() => {
        setBookingStep('selection');
        setConfirmationId('');
        setCheckinCode('');
        setTermsAccepted(false);
        setPaymentMethod(null);
    }, 300); // allow dialog to close before resetting
  }

  const amenities = useMemo(() => room.amenities.map(amenity => ({
    key: amenity,
    icon: amenityIcons[amenity],
    label: amenity.charAt(0).toUpperCase() + amenity.slice(1),
  })), [room.amenities]);
  
  const isConfirmationDisabled = !paymentMethod || checkinCode.length !== 4 || !termsAccepted;

  return (
    <>
      <Card className="overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 rounded-2xl flex flex-col bg-card border hover:border-primary/20 hover:shadow-primary/10">
        <div className="relative">
         <Carousel className="relative w-full group/carousel rounded-t-2xl overflow-hidden">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-56 w-full">
                  <Image
                    src={image.imageUrl}
                    alt={image.description}
                    data-ai-hint={image.imageHint}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
            <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/50 hover:bg-background/80 border-none" />
            <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/50 hover:bg-background/80 border-none" />
          
        </Carousel>
         {discount > 0 && (
            <Badge 
              variant="destructive"
              className="absolute top-3 right-3 text-base font-bold px-3 py-1 shadow-lg z-10"
            >
              -{discount}%
            </Badge>
          )}
        </div>

        <CardContent className="p-4 flex flex-col flex-1">
          <div className='flex justify-between items-start'>
            <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5"><BedDouble className="w-4 h-4" /> {room.hotelName}</p>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold text-foreground/90 pt-px">{room.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="font-bold text-lg leading-tight truncate mt-1">{room.roomName}</h3>
          
          <div className="flex items-center text-sm text-muted-foreground mt-2 gap-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{room.distance}км зайтай</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
             {amenities.map(a => (
                <TooltipProvider key={a.key}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <div className="flex items-center justify-center w-8 h-8 bg-secondary/70 rounded-lg">
                                {a.icon}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>{a.label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
             ))}
          </div>

          <div className="flex-grow" />

          <div className="flex justify-between items-end mt-6 pt-4 border-t">
            <div>
              {room.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">{room.originalPrice.toLocaleString()}₮</p>
              )}
              <p className="text-2xl font-bold text-primary">{room.price.toLocaleString()}₮</p>
            </div>
            <Button onClick={handleBookNow} className="font-bold shadow-md shadow-primary/30">
              Захиалах
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <AlertDialogContent>
        {bookingStep === 'selection' && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Захиалга баталгаажуулах</AlertDialogTitle>
                <AlertDialogDescription>
                   Та <span className="font-semibold text-foreground">{room.hotelName}</span>-д <span className="font-semibold text-foreground">{room.roomName}</span> өрөөг <span className="font-semibold text-foreground">{room.price.toLocaleString()}₮</span> үнээр захиалах гэж байна.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4 space-y-6">
                <div>
                    <Label className="font-semibold text-base">Төлбөрийн арга</Label>
                    <RadioGroup onValueChange={(value: PaymentMethod) => setPaymentMethod(value)} className="grid grid-cols-1 gap-3 mt-2">
                        <div>
                            <RadioGroupItem value="qpay" id="qpay" className="sr-only peer" />
                            <Label htmlFor="qpay" className="flex items-center gap-4 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <QPayIcon className="h-6 w-6 text-blue-600"/>
                            <div>
                                <span className="font-semibold">QPAY</span>
                                <p className="text-sm text-muted-foreground">QPay-ээр шууд төлөх</p>
                            </div>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="socialpay" id="socialpay" className="sr-only peer" />
                            <Label htmlFor="socialpay" className="flex items-center gap-4 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <SocialPayIcon className="h-6 w-6 text-purple-600" />
                            <div>
                                <span className="font-semibold">SocialPay</span>
                                <p className="text-sm text-muted-foreground">SocialPay-ээр шууд төлөх</p>
                            </div>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="transfer" id="transfer" className="sr-only peer" />
                            <Label htmlFor="transfer" className="flex items-center gap-4 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <TransferIcon className="h-6 w-6 text-gray-600"/>
                            <div>
                                <span className="font-semibold">Дансаар</span>
                                <p className="text-sm text-muted-foreground">Дансанд мөнгө шилжүүлэх</p>
                            </div>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="checkin-code" className="font-semibold text-base">
                        Нэвтрэх код
                    </Label>
                    <Input
                        id="checkin-code"
                        ref={initialFocusRef}
                        type="password"
                        placeholder="••••"
                        maxLength={4}
                        value={checkinCode}
                        onChange={(e) => setCheckinCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="text-center text-3xl tracking-[0.5em] font-mono h-14"
                    />
                     <div className='flex items-center gap-2 text-xs text-muted-foreground pt-1'>
                        <HelpCircle className="w-3 h-3"/>
                        <span>Энэ кодыг зочид буудалд өрөөгөө хүлээн авахдаа ашиглана.</span>
                     </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Би <a href="#" className="underline text-primary">үйлчилгээний нөхцөлийг</a> зөвшөөрч байна.
                    </label>
                  </div>
              </div>
              <AlertDialogFooter>
                 <AlertDialogCancel onClick={closeAndResetDialog}>Цуцлах</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmBooking} disabled={isConfirmationDisabled}>
                  Захиалга баталгаажуулах
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
        )}
        {bookingStep === 'booking' && (
            <div className="flex flex-col items-center justify-center p-8 gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-lg font-semibold">Таны өрөөг баталгаажуулж байна...</p>
                <p className="text-sm text-muted-foreground">Энэ нь түр зуур үргэлжилнэ.</p>
            </div>
        )}
        {bookingStep === 'success' && (
             <div className="flex flex-col items-center justify-center p-8 text-center gap-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h2 className="text-2xl font-bold">Захиалга баталгаажлаа!</h2>
                <p className="text-muted-foreground"><span className="font-semibold text-foreground">{room.hotelName}</span>-д таны өрөө баталгаажлаа. <br/> Таны захиалгын дугаар:</p>
                <p className="text-xl font-bold text-primary tracking-widest bg-secondary px-4 py-2 rounded-md">{confirmationId}</p>
                <p className="text-muted-foreground mt-2">Таны нэвтрэх код: <span className="font-bold text-foreground">{checkinCode}</span></p>
                <Button onClick={closeAndResetDialog} className="mt-4 w-full">Дуусгах</Button>
            </div>
        )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    

    