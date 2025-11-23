

"use client";

import Image from 'next/image';
import type { Room, RoomInstance, Amenity } from '@/lib/data';
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
} from "@/components/ui/carousel"
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRoom } from '@/context/RoomContext';
import { useToast } from '@/hooks/use-toast';
import { startOfDay } from 'date-fns';
import { Separator } from '../ui/separator';
import { amenityOptions } from '@/lib/data';


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
        <path fillRule="evenodd" clipRule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM11.1664 6.88339C10.741 6.64391 10.2319 6.83296 10.0152 7.27988C9.91436 7.47881 9.87034 7.71261 9.90169 7.94056L10.5181 12.3338C10.5739 12.7565 10.9254 13.0694 11.3468 13.0694H12.6521C13.2543 13.0694 13.7383 12.5854 13.7383 11.9832C13.7383 11.381 13.2543 10.897 12.6521 10.897H11.7583L12.0166 9.07174C12.0537 8.7997 11.8398 8.56022 11.5678 8.52309C11.5259 8.51741 11.4834 8.51741 11.4415 8.52309L10.3621 8.68114C10.0901 8.71827 9.87614 8.95775 9.83901 9.22971C9.80188 9.50166 10.0158 9.74114 10.2878 9.77827L10.9252 9.67498L10.5843 12.0832L11.3468 12.0832C11.6677 12.0832 11.9251 11.8257 11.9251 11.5048C11.9251 11.1839 11.6677 10.9265 11.3468 10.9265H10.7473L11.1664 6.88339ZM8.24391 10.88C8.61803 10.5529 9.17637 10.518 9.58579 10.7937L12.9818 13.2268C13.3855 13.5025 13.6896 13.9169 13.7372 14.3941L14.0747 17.6625C14.128 18.1906 13.7243 18.6439 13.1962 18.6972C12.6681 18.7505 12.2148 18.3468 12.1615 17.8187L11.866 14.938L9.04944 16.7932C8.64861 17.0688 8.14812 17.027 7.78822 16.6671C7.42832 16.3072 7.38655 15.8067 7.66223 15.4059L8.24391 10.88Z" fill="#00AEEF"/>
    </svg>
);

const SocialPayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="24" cy="24" r="24" fill="#7E469C"/>
        <path d="M24.0013 32.32C28.5833 32.32 32.3213 28.582 32.3213 24C32.3213 19.418 28.5833 15.68 24.0013 15.68C19.4193 15.68 15.6813 19.418 15.6813 24C15.6813 28.582 19.4193 32.32 24.0013 32.32Z" stroke="white" strokeWidth="3.2" strokeMiterlimit="10" strokeLinecap="round"/>
        <path d="M24 28.2C26.3152 28.2 28.2 26.3152 28.2 24C28.2 21.6848 26.3152 19.8 24 19.8C21.6848 19.8 19.8 21.6848 19.8 24C19.8 26.3152 21.6848 28.2 24 28.2Z" fill="white"/>
    </svg>
);

const TransferIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M17 10H3V12H17V10ZM21 6H3V8H21V6ZM13 14H3V16H13V14ZM21 18H3V20H21V18Z" fill="currentColor"/>
    </svg>
);

type RoomCardProps = {
  room: Room;
  availableInstances: RoomInstance[];
};


export function RoomCard({ room, availableInstances }: RoomCardProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<BookingStep>('details');
  const [checkinCode, setCheckinCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>('qpay');
  
  const { setRoomStatusForDate, toggleLike, likedRooms } = useRoom();
  const { toast } = useToast();
  const initialFocusRef = useRef<HTMLInputElement>(null);
  
  const availableCount = availableInstances.length;
  const isSoldOut = availableCount === 0;
  const totalPrice = room.price + SERVICE_FEE;
  const isLiked = likedRooms.includes(room.id);

  useEffect(() => {
    if (isBookingOpen && bookingStep === 'details') {
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
        const instanceToBook = availableInstances[0];
        setRoomStatusForDate(
            instanceToBook.instanceId,
            startOfDay(new Date()),
            'booked',
            checkinCode
        );
        setBookingStep('success');
    }, 1500);
  };

  const closeAndResetDialog = () => {
    setIsBookingOpen(false);
    setTimeout(() => {
        setBookingStep('details');
        setCheckinCode('');
        setTermsAccepted(false);
        setPaymentMethod(null);
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
    <React.Fragment>
      <Card className="overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 rounded-2xl bg-card border-transparent hover:border-primary/20 shadow-lg hover:shadow-primary/10 flex flex-col">
        <div className="relative">
         <Carousel className="relative w-full group/carousel rounded-t-2xl overflow-hidden">
          <CarouselContent>
            {(images.length > 0 ? images : [PlaceHolderImages[0]]).map((image, index) => (
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
              className="absolute top-3 left-3 text-sm font-bold flex items-center gap-1 shadow-lg"
            >
              <Zap className="w-4 h-4" />
              <span>{discount}% Хямдрал</span>
            </Badge>
          )}
           {isSoldOut && (
            <Badge className="absolute top-3 right-3 text-sm font-bold bg-black/60 text-white">
              Дууссан
            </Badge>
          )}
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute top-2 right-2 h-9 w-9 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm"
            onClick={handleLikeClick}
          >
              <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")}/>
          </Button>
        </div>

        <CardContent className="p-4 flex flex-col flex-1">
          <div className='flex justify-between items-start'>
            <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5"><BedDouble className="w-4 h-4" /> {room.hotelName}</p>
            <div className="flex items-center gap-1 text-sm">
                <Heart className="w-4 h-4 text-red-500 fill-red-500/50" />
                <span className="font-semibold text-foreground/90">{room.likes || 0}</span>
            </div>
          </div>

          <h3 className="font-bold text-lg leading-tight truncate mt-1">{room.roomName}</h3>
          
          <div className="flex items-center text-sm text-muted-foreground mt-2 gap-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{room.location}</span>
            </div>
            <span>{room.distance}км</span>
          </div>

          <UrgencyMessage />

          <div className="flex-grow" />

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {Object.keys(amenityIcons).slice(0, 5).map(key => {
                const amenity = room.amenities.find(a => a === key);
                if (!amenity) return null;
                const option = amenityOptions.find(o => o.id === amenity);
                return (
                    <TooltipProvider key={key}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center justify-center w-8 h-8 bg-secondary/70 rounded-lg">
                                    {amenityIcons[amenity]}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>{option?.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            })}
          </div>

          <div className="flex justify-between items-end mt-4 pt-4 border-t">
            <div>
              {room.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">{room.originalPrice.toLocaleString()}₮</p>
              )}
              <p className="text-2xl font-bold text-primary">{room.price.toLocaleString()}₮</p>
            </div>
            <Button onClick={handleBookNow} className="font-bold shadow-md shadow-primary/30" disabled={isSoldOut}>
              {isSoldOut ? 'Дууссан' : 'Захиалах'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <React.Fragment key={room.id}>
        <AlertDialog open={isBookingOpen} onOpenChange={(open) => !open && closeAndResetDialog()}>
          <AlertDialogContent>
          {bookingStep === 'details' && (
              <>
                <AlertDialogHeader className='-m-6 mb-0'>
                  <Carousel className="relative w-full rounded-t-lg overflow-hidden">
                      <CarouselContent>
                          {(images.length > 0 ? images : [PlaceHolderImages[0]]).map((image) => (
                          <CarouselItem key={image.id}>
                              <div className="relative h-48 w-full">
                              <Image
                                  src={image.imageUrl}
                                  alt={image.description}
                                  data-ai-hint={image.imageHint}
                                  fill
                                  className="object-cover"
                              />
                              </div>
                          </CarouselItem>
                          ))}
                      </CarouselContent>
                      <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/50 hover:bg-background/80 border-none" />
                      <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/50 hover:bg-background/80 border-none" />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent' />
                      <div className='absolute bottom-4 left-4 text-white'>
                          <AlertDialogTitle className='text-xl'>{room.hotelName}</AlertDialogTitle>
                          <AlertDialogDescription className='text-white/90'>{room.roomName}</AlertDialogDescription>
                      </div>
                  </Carousel>
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
                          <p>Өрөөний үнэ</p>
                          <p className='font-medium'>{room.price.toLocaleString()}₮</p>
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
                                      <p>Аппликейшний найдвартай, тасралтгүй <br/> ажиллагааг хангахад зориулагдана.</p>
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
                          type="password"
                          placeholder="••••"
                          maxLength={4}
                          value={checkinCode}
                          onChange={(e) => setCheckinCode(e.target.value.replace(/[^0-9]/g, ''))}
                          className="text-center text-3xl tracking-[0.5em] font-mono h-14 bg-background"
                      />
                  </div>

                  <div className="flex items-center space-x-2">
                      <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
                      <label htmlFor="terms" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Би <a href="#" className="underline text-primary">үйлчилгээний нөхцөлийг</a> зөвшөөрч байна.
                      </label>
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
                      <div className='text-center'>
                          <p className="text-sm text-muted-foreground">Төлөх дүн</p>
                          <p className="text-4xl font-bold text-primary">{totalPrice.toLocaleString()}₮</p>
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
                          <Separator/>
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
                          </Aler tDescription>
                      </Alert>
                  </div>
                  <AlertDialogFooter>
                      <AlertDialogAction onClick={closeAndResetDialog} className="w-full">Ойлголоо</AlertDialogAction>
                  </AlertDialogFooter>
              </>
          )}
          </AlertDialogContent>
        </AlertDialog>
      </React.Fragment>
    </React.Fragment>
  );
}

    