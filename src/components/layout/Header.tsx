"use client";

import { BedDouble, PlusCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OwnerLoginForm } from '@/components/auth/OwnerLoginForm';
import { AddRoomForm } from '@/components/rooms/AddRoomForm';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold">
          <BedDouble className="h-7 w-7 text-primary" />
          <span className="text-2xl font-headline tracking-tight">XRoom Tonight</span>
        </Link>

        <div className="flex items-center gap-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost">
                        <PlusCircle className="mr-2" />
                        List your room
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>List your Room</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to list your available room for tonight.
                        </DialogDescription>
                    </DialogHeader>
                    <AddRoomForm />
                </DialogContent>
            </Dialog>

            <Dialog>
                <DialogTrigger asChild>
                     <Button>
                        <LogIn className="mr-2" />
                        Owner Login
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                     <DialogHeader>
                        <DialogTitle>Owner Login</DialogTitle>
                        <DialogDescription>
                            Access your hotel management dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <OwnerLoginForm />
                </DialogContent>
            </Dialog>
        </div>
      </div>
    </header>
  );
}
