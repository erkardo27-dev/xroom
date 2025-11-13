"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, LogIn } from 'lucide-react';
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
import { Logo } from './Logo';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8 w-auto" />
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
