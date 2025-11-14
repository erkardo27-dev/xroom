"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, LogIn, LogOut, Settings, Building } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
  } from "@/components/ui/dropdown-menu"
import { OwnerLoginForm } from '@/components/auth/OwnerLoginForm';
import { RoomForm } from '@/components/rooms/RoomForm';
import { Logo } from './Logo';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useRouter } from 'next/navigation';
import { HotelSettingsForm } from '../dashboard/HotelSettingsForm';

type DialogType = 'addRoom' | 'login' | 'settings' | null;

export default function Header({ isDashboard = false }: { isDashboard?: boolean }) {
  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  const { isLoggedIn, userEmail, hotelInfo, logout } = useAuth();
  const router = useRouter();


  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setOpenDialog(null);
    }
  };

  const handleDialogTrigger = (dialog: DialogType) => {
    setOpenDialog(dialog);
  };
  
  const getAvatarFallback = (email: string | null) => {
    return email ? email.charAt(0).toUpperCase() : '?';
  }

  const handleLogout = async () => {
    await logout();
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8 w-auto text-primary" />
           {isDashboard && <span className="font-semibold text-muted-foreground hidden sm:inline-block">/ {hotelInfo?.hotelName || "Миний самбар"}</span>}
        </Link>

        <Dialog open={!!openDialog} onOpenChange={handleOpenChange}>
            {isLoggedIn ? (
                <div className="flex items-center gap-2">
                     <DialogTrigger asChild>
                        <Button onClick={() => handleDialogTrigger('addRoom')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Шинэ өрөөний төрөл
                        </Button>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => handleDialogTrigger('settings')}>
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                               <Avatar className="h-9 w-9">
                                    <AvatarFallback>{getAvatarFallback(userEmail)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                             <DropdownMenuLabel className='flex items-center gap-2'>
                                <Building className="w-4 h-4" />
                                <span className='font-bold'>{hotelInfo?.hotelName}</span>
                            </DropdownMenuLabel>
                            <DropdownMenuItem disabled>
                                {userEmail}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => router.push(isDashboard ? '/' : '/dashboard')}>
                                {isDashboard ? 'Нүүр хуудас' : 'Миний самбар'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Гарах
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : (
                <DialogTrigger asChild>
                    <Button onClick={() => handleDialogTrigger('login')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Өрөө нэмэх
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-md">
                {openDialog === 'login' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>XRoom Tonight-д тавтай морил!</DialogTitle>
                            <DialogDescription>
                                Өөрийн зочид буудлаа бүртгүүлж, өрөөгөө сүүлчийн минутын хямдралтай үнээр борлуулаарай.
                            </DialogDescription>
                        </DialogHeader>
                        <OwnerLoginForm onFormSubmit={() => handleOpenChange(false)}/>
                    </>
                )}
                 {openDialog === 'addRoom' && isLoggedIn && (
                    <>
                         <DialogHeader>
                            <DialogTitle>Шинэ өрөөний төрөл нэмэх</DialogTitle>
                            <DialogDescription>
                                {hotelInfo?.hotelName}-д шинээр өрөөний төрөл үүсгэнэ үү.
                            </DialogDescription>
                        </DialogHeader>
                        <RoomForm onFormSubmit={() => handleOpenChange(false)}/>
                    </>
                )}
                 {openDialog === 'settings' && isLoggedIn && (
                    <>
                         <DialogHeader>
                            <DialogTitle>Зочид буудлын тохиргоо</DialogTitle>
                            <DialogDescription>
                                Та зочид буудлынхаа үндсэн мэдээллийг эндээс засаж болно.
                            </DialogDescription>
                        </DialogHeader>
                        <HotelSettingsForm onFormSubmit={() => handleOpenChange(false)}/>
                    </>
                )}
            </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
