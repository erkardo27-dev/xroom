
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, LogIn, LogOut, Settings, Building, BarChart2, DollarSign, LayoutGrid, Menu, Hotel, ShieldCheck, Calendar } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet"
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

export default function Header({ isDashboard = false }: { isDashboard?: boolean; }) {
    const [openDialog, setOpenDialog] = useState<DialogType>(null);
    const { isLoggedIn, userEmail, hotelInfo, logout, isAdmin, isLoading } = useAuth();
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
        if (isAdmin) return 'A';
        return email ? email.charAt(0).toUpperCase() : '?';
    }

    const handleLogout = async () => {
        await logout();
    }

    const getDashboardTitle = () => {
        if (isLoading) return '...';
        return hotelInfo?.hotelName || "Миний самбар";
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
                <Link href="/" className="flex items-center gap-3">
                    <Logo className="h-8 w-auto text-primary" />
                    {isDashboard && !isAdmin && <span className="font-semibold text-muted-foreground hidden sm:inline-block">/ {getDashboardTitle()}</span>}
                    {isAdmin && <span className="font-semibold text-muted-foreground hidden sm:inline-block">/ Админ</span>}
                </Link>


                {isLoggedIn ? (
                    <>
                        <div className="hidden sm:flex items-center gap-2">
                            {isAdmin ? (
                                <Button variant="outline" onClick={() => router.push('/admin')}>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Админ самбар
                                </Button>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={() => router.push('/dashboard')}>
                                        <LayoutGrid className="mr-2 h-4 w-4" />
                                        Миний өрөөнүүд
                                    </Button>
                                    <Button variant="outline" onClick={() => router.push('/dashboard/stats')}>
                                        <BarChart2 className="mr-2 h-4 w-4" />
                                        Статистик
                                    </Button>
                                    <Button variant="outline" onClick={() => router.push('/dashboard/pricing')}>
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Үнийн удирдлага
                                    </Button>
                                    <Button variant="outline" onClick={() => router.push('/dashboard/calendar')}>
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Календарь
                                    </Button>
                                    <Button variant="outline" onClick={() => handleDialogTrigger('settings')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Буудлын тохиргоо
                                    </Button>
                                    <Button onClick={() => handleDialogTrigger('addRoom')}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Өрөө нэмэх
                                    </Button>
                                </>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>{getAvatarFallback(userEmail)}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    {isAdmin ? (
                                        <DropdownMenuLabel className='flex items-center gap-2'>
                                            <ShieldCheck className="w-4 h-4" />
                                            <span className='font-bold'>Админ</span>
                                        </DropdownMenuLabel>
                                    ) : (
                                        <DropdownMenuLabel className='flex items-center gap-2'>
                                            <Building className="w-4 h-4" />
                                            <span className='font-bold'>{hotelInfo?.hotelName}</span>
                                        </DropdownMenuLabel>
                                    )}
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
                        <div className="sm:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>{isAdmin ? "Админ" : (hotelInfo?.hotelName || "Цэс")}</SheetTitle>
                                        <SheetDescription>{userEmail}</SheetDescription>
                                    </SheetHeader>
                                    <div className="flex flex-col gap-3 py-6">
                                        {isAdmin ? (
                                            <SheetClose asChild>
                                                <Button variant="outline" className="justify-start" onClick={() => router.push('/admin')}>
                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                    Админ самбар
                                                </Button>
                                            </SheetClose>
                                        ) : (
                                            <>
                                                <SheetClose asChild>
                                                    <Button variant="outline" className="justify-start" onClick={() => router.push('/dashboard')}>
                                                        <LayoutGrid className="mr-2 h-4 w-4" />
                                                        Миний өрөөнүүд
                                                    </Button>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <Button variant="outline" className="justify-start" onClick={() => router.push('/dashboard/stats')}>
                                                        <BarChart2 className="mr-2 h-4 w-4" />
                                                        Статистик
                                                    </Button>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <Button variant="outline" className="justify-start" onClick={() => router.push('/dashboard/pricing')}>
                                                        <DollarSign className="mr-2 h-4 w-4" />
                                                        Үнийн удирдлага
                                                    </Button>
                                                </SheetClose>

                                                <DropdownMenuSeparator />
                                                <SheetClose asChild>
                                                    <Button variant="outline" className="justify-start" onClick={() => handleDialogTrigger('settings')}>
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        Буудлын тохиргоо
                                                    </Button>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <Button className="justify-start" onClick={() => handleDialogTrigger('addRoom')}>
                                                        <PlusCircle className="mr-2 h-4 w-4" />
                                                        Өрөө нэмэх
                                                    </Button>
                                                </SheetClose>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <SheetClose asChild>
                                            <Button variant="destructive" className="justify-start" onClick={handleLogout}>
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Гарах
                                            </Button>
                                        </SheetClose>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button onClick={() => handleDialogTrigger('login')}>
                            <Hotel className="mr-2 h-4 w-4" />
                            Өрөөгөө бүртгүүлэх
                        </Button>
                    </div>
                )}


            </div>

            <Dialog open={!!openDialog} onOpenChange={handleOpenChange}>
                <DialogContent className={openDialog === 'settings' ? "sm:max-w-lg" : "sm:max-w-md"}>
                    {openDialog === 'login' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>XRoom Tonight-д тавтай морил!</DialogTitle>
                                <DialogDescription>
                                    Та буудал ажиллуулдаг бөгөөд манай сайтад өрөө оруулах гэж байгаа бол бүртгүүлнэ үү.
                                </DialogDescription>
                            </DialogHeader>
                            <OwnerLoginForm onFormSubmit={() => handleOpenChange(false)} />
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
                            <RoomForm onFormSubmit={() => handleOpenChange(false)} />
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
                            <HotelSettingsForm onFormSubmit={() => handleOpenChange(false)} />
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </header>
    );
}
