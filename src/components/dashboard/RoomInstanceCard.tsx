'use client';

import { useState, useMemo } from 'react';
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
import { Edit, MoreVertical, Power, PowerOff, Trash2, Wrench, Bed, Tag, UserCheck, KeyRound, LogOut } from 'lucide-react';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '../ui/tooltip';

type RoomInstanceCardProps = {
  instance: RoomInstance;
  onEditType: (roomType: Room) => void;
  onDeleteType: (roomType: Room) => void;
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
        style: string;
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
      style: 'bg-green-500 hover:bg-green-600',
    }
  },
  booked: { 
    label: 'Захиалгатай', 
    color: 'bg-yellow-500', 
    borderColor: 'border-yellow-500/50', 
    icon: <Tag className="w-4 h-4 mr-2" />,
    action: {
        text: 'Зочин ирсэн',
        icon: <UserCheck className="w-4 h-4 mr-2"/>,
        nextStatus: 'occupied',
        disabled: false,
        style: 'bg-yellow-500 hover:bg-yellow-600',
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
        style: 'bg-blue-500 hover:bg-blue-600',
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
        style: 'bg-orange-500 hover:bg-orange-600',
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
        style: 'bg-gray-500 hover:bg-gray-600',
    }
  },
};


export function RoomInstanceCard({ instance, onEditType, onDeleteType, selectedDate }: RoomInstanceCardProps) {
  const { getRoomById, updateRoomInstance, setRoomStatusForDate } = useRoom();
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [roomNumber, setRoomNumber] = useState(instance.roomNumber);
  const { toast } = useToast();

  const roomType = useMemo(() => getRoomById(instance.roomTypeId), [instance.roomTypeId, getRoomById]);

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
    // Note: this only updates the base roomNumber, not a date-specific one.
    updateRoomInstance({ ...instance, roomNumber: roomNumber.trim() });
    setIsEditingNumber(false);
  }

  return (
    <Card className={cn("flex flex-col justify-between border-2", currentStatus.borderColor)}>
      <CardHeader>
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
                <CardDescription>{roomType.roomName}</CardDescription>
            </div>
            <div className='flex items-center gap-1'>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => onEditType(roomType)}>
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
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive" onClick={() => onDeleteType(roomType)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                             <p>Өрөөний төрөл устгах</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
      </CardHeader>
      <CardContent className='flex-grow'>
        <div className="flex items-center">
            <span className={cn("h-2.5 w-2.5 rounded-full mr-2", currentStatus.color)}></span>
            <span className="text-sm font-medium">{currentStatus.label}</span>
        </div>
        {instance.status === 'booked' && instance.bookingCode && (
            <div className="mt-2 text-center bg-secondary/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Нэвтрэх код:</p>
                <p className="text-3xl font-mono font-bold tracking-widest text-primary">{instance.bookingCode}</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
            onClick={handleActionClick} 
            className={cn("w-full", currentStatus.action.style)} 
            disabled={currentStatus.action.disabled}
        >
            {currentStatus.action.icon}
            {currentStatus.action.text}
        </Button>
      </CardFooter>
    </Card>
  );
}
