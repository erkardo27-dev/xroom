"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, LogIn, ChevronDown, LogOut } from 'lucide-react';
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
  } from "@/components/ui/dropdown-menu"
import { OwnerLoginForm } from '@/components/auth/OwnerLoginForm';
import { AddRoomForm } from '@/components/rooms/AddRoomForm';
import { Logo } from './Logo';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '../ui/avatar';

type DialogType = 'addRoom' | 'login' | null;

export default function Header() {
  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { isLoggedIn, userEmail, logout } = useAuth();


  const handleOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setOpenDialog(null);
    }
  };

  const handleDialogTrigger = (dialog: DialogType) => {
    setOpenDialog(dialog);
    setIsFormOpen(true);
  };
  
  const getAvatarFallback = (email: string | null) => {
    return email ? email.charAt(0).toUpperCase() : '?';
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8 w-auto text-primary" />
        </Link>

        <Dialog open={isFormOpen} onOpenChange={handleOpenChange}>
            {isLoggedIn ? (
                <div className="flex items-center gap-4">
                     <DialogTrigger asChild onClick={() => handleDialogTrigger('addRoom')}>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Өрөө оруулах
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
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled>
                                {userEmail}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Гарах
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Эзэмшигч
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DialogTrigger asChild onClick={() => handleDialogTrigger('addRoom')}>
                            <DropdownMenuItem>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Өрөө оруулах (Нэвтрэх)
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogTrigger asChild onClick={() => handleDialogTrigger('login')}>
                            <DropdownMenuItem>
                                <LogIn className="mr-2 h-4 w-4" />
                                Нэвтрэх
                            </DropdownMenuItem>
                        </DialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            <DialogContent className="sm:max-w-[425px]">
                {openDialog === 'addRoom' && (
                    <>
                         <DialogHeader>
                            <DialogTitle>Өрөө оруулах</DialogTitle>
                            <DialogDescription>
                                {isLoggedIn ? 'Энэ шөнийн сул өрөөгөө бүртгүүлэхийн тулд доорх мэдээллийг бөглөнө үү.' : 'Өрөө оруулахын тулд эхлээд нэвтэрнэ үү.'}
                            </DialogDescription>
                        </DialogHeader>
                        {isLoggedIn ? <AddRoomForm onFormSubmit={() => handleOpenChange(false)}/> : <OwnerLoginForm onFormSubmit={() => handleOpenChange(false)} />}
                    </>
                )}
                {openDialog === 'login' && (
                     <>
                        <DialogHeader>
                            <DialogTitle>Эзэмшигч нэвтрэх</DialogTitle>
                            <DialogDescription>
                                Зочид буудлын удирдлагын самбартаа нэвтрэх.
                            </DialogDescription>
                        </DialogHeader>
                        <OwnerLoginForm onFormSubmit={() => handleOpenChange(false)}/>
                    </>
                )}
            </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
