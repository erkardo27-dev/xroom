
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Room, RoomInstance, RoomStatus } from '@/lib/data';
import { useRoom } from '@/context/RoomContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Power, PowerOff, Trash2, Wrench, Bed, Tag, UserCheck, KeyRound, LogOut, Pencil, Check } from 'lucide-react';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '../ui/tooltip';
import { Separator } from '../ui/separator';

type RoomInstanceCardProps = {
  instance: RoomInstance & { status: RoomStatus; bookingCode?: string }; // Augmented instance
  onEditType: (roomType: Room) => void;
  onDeleteInstance: (instance: RoomInstance) => void;
  selectedDate: Date;
};

type StatusConfig = {
    label: string;
    color: string;
    borderColor: string;
    icon: React.ReactNode;
    action: {
        text: string;
        icon: React.ReactNode;
        nextStatus: RoomStatus;
        disabled: boolean;
    };
};

const statusConfig: { [key in RoomStatus]: StatusConfig } = {
  available: { 
    label: 'Сул', 
    color: 'bg-green-500', 
    borderColor: 'border-green-500/50', 
    icon: <Bed className="w-4 h-4 mr-2" />,
    action: {
      text: 'Хаах',
      icon: <PowerOff className="w-4 h-4 mr-2"/>,
      nextStatus: 'closed',
      disabled: false,
    }
  },
  booked: { 
    label: 'Захиалгатай', 
    color: 'bg-yellow-500', 
    borderColor: 'border-yellow-500/50', 
    icon: <Tag className="w-4 h-4 mr-2" />,
    action: {
        text: 'Зочинг оруулах',
        icon: <UserCheck className="w-4 h-4 mr-2"/>,
        nextStatus: 'occupied',
        disabled: false,
    }
  },
  occupied: {
    label: 'Байрлаж байна',
    color: 'bg-blue-500',
    borderColor: 'border-blue-500/50',
    icon: <KeyRound className="w-4 h-4 mr-2" />,
    action: {
        text: 'Тооцоо хаах',
        icon: <LogOut className="w-4 h-4 mr-2" />,
        nextStatus: 'available',
        disabled: false,
    }
  },
  maintenance: { 
    label: 'Засвартай', 
    color: 'bg-orange-500', 
    borderColor: 'border-orange-500/50', 
    icon: <Wrench className="w-4 h-4 mr-2" />,
    action: {
        text: 'Засвартай',
        icon: <Wrench className="w-4 h-4 mr-2"/>,
        nextStatus: 'maintenance',
        disabled: true,
    }
  },
  closed: { 
    label: 'Хаалттай', 
    color: 'bg-gray-500', 
    borderColor: 'border-gray-500/50', 
    icon: <PowerOff className="w-4 h-4 mr-2" />,
    action: {
        text: 'Нээх',
        icon: <Power className="w-4 h-4 mr-2"/>,
        nextStatus: 'available',
        disabled: false,
    }
  },
};


export function RoomInstanceCard({ instance, onEditType, onDeleteInstance, selectedDate }: RoomInstanceCardProps) {
  const { getRoomById, updateRoomInstance, setRoomStatusForDate, getRoomPriceForDate, setRoomPriceForDate } = useRoom();
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [roomNumber, setRoomNumber] = useState(instance.roomNumber);
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  const { toast } = useToast();

  const roomType = useMemo(() => getRoomById(instance.roomTypeId), [instance.roomTypeId, getRoomById]);
  
  const priceForDate = getRoomPriceForDate(instance.instanceId, selectedDate);
  const [localPrice, setLocalPrice] = useState(priceForDate);

  useEffect(() => {
    setLocalPrice(priceForDate);
  }, [priceForDate]);


  if (!roomType) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Алдаа</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Өрөөний төрлийн мэдээлэл олдсонгүй.</p>
        </CardContent>
      </Card>
    );
  }
  
  const currentStatus = statusConfig[instance.status];
  const isPriceOverridden = priceForDate !== roomType.price;

  const handleActionClick = () => {
    const nextStatus = currentStatus.action.nextStatus;
    setRoomStatusForDate(instance.instanceId, selectedDate, nextStatus);
    toast({
      title: `Төлөв өөрчлөгдлөө`,
      description: `"${roomType.roomName}" (${instance.roomNumber}) өрөөний төлөв ${statusConfig[nextStatus].label} боллоо.`,
    });
  };
  
  const handleRoomNumberSave = () => {
    if (roomNumber.trim() === '') {
        toast({ variant: 'destructive', title: "Өрөөний дугаар хоосон байж болохгүй." });
        return;
    }
    updateRoomInstance({ instanceId: instance.instanceId, roomNumber: roomNumber.trim() });
    setIsEditingNumber(false);
  }
  
  const handlePriceSave = () => {
      const newPrice = Number(localPrice);
      if (isNaN(newPrice) || newPrice <= 0) {
          toast({ variant: "destructive", title: "Үнэ буруу байна" });
          setLocalPrice(priceForDate); // revert
          return;
      }
      setRoomPriceForDate(instance.instanceId, selectedDate, newPrice);
      setIsEditingPrice(false);
  }

  const isBooked = instance.status === 'booked' && instance.bookingCode;

  return (
    <Card className={cn("flex flex-col justify-between border-2", currentStatus.borderColor)}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
            <div className='flex-1'>
                {isEditingNumber ? (
                    <Input 
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        onBlur={handleRoomNumberSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleRoomNumberSave()}
                        autoFocus
                        className="h-8 text-lg font-bold p-1 -m-1"
                    />
                ) : (
                    <CardTitle className="text-lg cursor-pointer" onClick={() => setIsEditingNumber(true)}>
                        {instance.roomNumber === "..." ? "Дугаар оноох" : `${instance.roomNumber} тоот`}
                    </CardTitle>
                )}
                <CardDescription className="text-xs">{roomType.roomName}</CardDescription>
            </div>
            <div className='flex items-center gap-0'>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => onEditType(roomType)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Өрөөний төрөл засах</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => onDeleteInstance(instance)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                             <p>Энэ өрөөг устгах</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
      </CardHeader>
      <CardContent className='flex-grow p-4 pt-0 flex flex-col justify-end space-y-3'>
        {isBooked ? (
            <div className='text-center'>
                 <p className="text-xs text-muted-foreground">Нэвтрэх код:</p>
                 <p className="text-3xl font-mono font-bold tracking-widest text-primary bg-secondary/50 p-2 rounded-lg">{instance.bookingCode}</p>
            </div>
        ) : (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Үнэ</span>
                {isEditingPrice ? (
                  <div className="relative w-28">
                    <Input 
                      type="number"
                      value={localPrice}
                      onChange={(e) => setLocalPrice(Number(e.target.value))}
                      onBlur={handlePriceSave}
                      onKeyDown={(e) => e.key === 'Enter' && handlePriceSave()}
                      autoFocus
                      className="h-7 text-sm font-bold pr-7"
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6 absolute top-0.5 right-0.5" onClick={handlePriceSave}>
                        <Check className="h-4 w-4" />
                    </Button>
                  </div>
              ) : (
                  <div className="flex items-center gap-2">
                      {isPriceOverridden && (
                          <span className="text-xs text-muted-foreground line-through">{roomType.price.toLocaleString()}₮</span>
                      )}
                      <span className={cn(
                          "font-semibold",
                          isPriceOverridden ? "text-orange-500" : "text-primary"
                      )}>
                          {priceForDate.toLocaleString()}₮
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditingPrice(true)}>
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                  </div>
              )}
            </div>
        )}
        
        <Separator />
        
        <div className="flex items-center">
            <span className={cn("h-2.5 w-2.5 rounded-full mr-2", currentStatus.color)}></span>
            <span className="text-sm font-medium">{currentStatus.label}</span>
        </div>
      </CardContent>
      <CardFooter className="p-2">
        <Button 
            onClick={handleActionClick} 
            className={cn("w-full hover:brightness-110", currentStatus.color)} 
            disabled={currentStatus.action.disabled}
        >
            {currentStatus.action.icon}
            {currentStatus.action.text}
        </Button>
      </CardFooter>
    </Card>
  );
}
