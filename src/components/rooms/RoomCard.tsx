"use client";

import Image from 'next/image';
import type { Room } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Wifi, ParkingSquare, UtensilsCrossed, CheckCircle, Loader2, BedDouble, HelpCircle } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useState, useMemo } from 'react';

const amenityIcons: { [key: string]: React.ReactNode } = {
    wifi: <Wifi className="w-4 h-4" />,
    parking: <ParkingSquare className="w-4 h-4" />,
    restaurant: <UtensilsCrossed className="w-4 h-4" />,
};

type BookingStep = 'payment' | 'booking' | 'success';

export function RoomCard({ room }: { room: Room }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<BookingStep>('payment');
  const [confirmationId, setConfirmationId] = useState('');
  const [paymentCode, setPaymentCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);


  const image = PlaceHolderImages.find(img => img.id === room.imageId);
  const discount = room.originalPrice ? Math.round(((room.originalPrice - room.price) / room.originalPrice) * 100) : 0;

  const handleBookNow = () => {
    setIsBookingOpen(true);
  };
  
  const handleConfirmPayment = () => {
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
        setBookingStep('payment');
        setConfirmationId('');
        setPaymentCode('');
        setTermsAccepted(false);
    }, 300); // allow dialog to close before resetting
  }

  const amenities = useMemo(() => room.amenities.map(amenity => ({
    key: amenity,
    icon: amenityIcons[amenity],
    label: amenity.charAt(0).toUpperCase() + amenity.slice(1),
  })), [room.amenities]);
  
  const isPaymentButtonDisabled = paymentCode.length !== 4 || !termsAccepted;

  return (
    <>
      <Card className="overflow-hidden group transition-shadow duration-300 hover:shadow-2xl flex flex-col">
        <div className="relative">
          {image && (
            <Image
              src={image.imageUrl}
              alt={image.description}
              data-ai-hint={image.imageHint}
              width={800}
              height={600}
              className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
            />
          )}
          {discount > 0 && (
            <Badge variant="destructive" className="absolute top-3 right-3 bg-accent text-accent-foreground border-accent text-sm">
              {discount}% ХЯМДРАЛ
            </Badge>
          )}
        </div>

        <CardContent className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-lg leading-tight truncate font-headline">{room.roomName}</h3>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5"><BedDouble className="w-4 h-4" /> {room.hotelName}</p>
          
          <div className="flex items-center text-sm text-muted-foreground mt-2 gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{room.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{room.distance}км зайтай</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 text-muted-foreground">
             {amenities.map(a => (
                <div key={a.key} className="flex items-center gap-1" title={a.label}>
                    {a.icon}
                </div>
             ))}
          </div>

          <div className="flex-grow" />

          <div className="flex justify-between items-end mt-4">
            <div>
              <p className="text-2xl font-bold text-foreground">${room.price}</p>
              {room.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">${room.originalPrice}</p>
              )}
            </div>
            <Button onClick={handleBookNow} variant="default" className="bg-primary hover:bg-primary/90">
              Шөнөөр захиалах
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <AlertDialogContent>
        {bookingStep === 'payment' && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Төлбөр гүйцэтгэх</AlertDialogTitle>
                <AlertDialogDescription>
                   Та <span className="font-semibold text-foreground">{room.hotelName}</span>-д <span className="font-semibold text-foreground">{room.roomName}</span> өрөөг <span className="font-semibold text-foreground">${room.price}</span> үнээр захиалах гэж байна.
                   Төлбөрөө (QPAY, SocialPay) хийж, гүйлгээний утга хэсгээс 4 оронтой баталгаажуулах кодыг оруулна уу.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-code" className="flex items-center">
                        Баталгаажуулах код (4 оронтой)
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="w-4 h-4 ml-1.5 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Гүйлгээний утга дээр ирэх 4 оронтой код.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </Label>
                    <Input
                        id="payment-code"
                        type="password"
                        placeholder="••••"
                        maxLength={4}
                        value={paymentCode}
                        onChange={(e) => setPaymentCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="text-center tracking-[0.5em]"
                    />
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
                <AlertDialogAction onClick={handleConfirmPayment} disabled={isPaymentButtonDisabled} className="bg-green-600 hover:bg-green-700 text-white">
                  Төлбөрийг баталгаажуулах
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
                <p className="text-lg font-bold text-primary tracking-widest bg-muted px-4 py-2 rounded-md">{confirmationId}</p>
                <Button onClick={closeAndResetDialog} className="mt-4 w-full">Дуусгах</Button>
            </div>
        )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
