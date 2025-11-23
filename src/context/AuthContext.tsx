

"use client";

import { Amenity } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth as useFirebaseAuth } from "@/firebase";

export type HotelInfo = {
    id: string; // user.uid
    hotelName: string;
    location: string;
    detailedAddress?: string;
    latitude?: number;
    longitude?: number;
    phoneNumber: string;
    amenities?: Amenity[];
    galleryImageIds?: string[];
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    contractSignedOn?: string;
    signatureName?: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  userEmail: string | null;
  hotelInfo: HotelInfo | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password: string, hotelData: Omit<HotelInfo, 'id' | 'amenities' | 'galleryImageIds' | 'detailedAddress' | 'latitude' | 'longitude'>) => Promise<void>;
  logout: () => Promise<void>;
  updateHotelInfo: (hotelInfo: Partial<Omit<HotelInfo, 'id'>>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const hotelInfoRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'hotels', user.uid);
  }, [firestore, user]);
  
  const { data: hotelInfo, isLoading: isHotelInfoLoading } = useDoc<HotelInfo>(hotelInfoRef);

  const isLoading = isUserLoading || isHotelInfoLoading;
  const isLoggedIn = !!user;
  const userEmail = user?.email || null;

  const login = async (email: string, password?: string) => {
    try {
        if (password) {
            await signInWithEmailAndPassword(auth, email, password);
        }
        toast({
            title: "Амжилттай нэвтэрлээ",
        });
        router.push('/dashboard');
        router.refresh();
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Нэвтрэхэд алдаа гарлаа",
            description: "И-мэйл эсвэл нууц үг буруу байна.",
        });
    }
  };

  const register = async (email: string, password: string, hotelData: Omit<HotelInfo, 'id' | 'amenities' | 'galleryImageIds' | 'detailedAddress' | 'latitude' | 'longitude'>) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newHotelInfo: HotelInfo = {
            id: userCredential.user.uid,
            ...hotelData,
            amenities: [],
            galleryImageIds: [],
        };
        const newHotelRef = doc(firestore, "hotels", userCredential.user.uid);
        await setDoc(newHotelRef, newHotelInfo);
        
        toast({
            title: "Амжилттай бүртгүүллээ",
            description: `${hotelData.hotelName}-д тавтай морилно уу.`,
        });
        router.push('/dashboard');
        router.refresh();
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Бүртгүүлэхэд алдаа гарлаа",
            description: error.message,
        });
    }
  }
  
  const updateHotelInfo = async (newHotelInfo: Partial<Omit<HotelInfo, 'id'>>) => {
      if (hotelInfoRef) {
          try {
            await setDoc(hotelInfoRef, newHotelInfo, { merge: true });
            toast({
                title: "Амжилттай",
                description: "Зочид буудлын мэдээлэл шинэчлэгдлээ.",
            });
          } catch(error: any) {
             toast({
                variant: "destructive",
                title: "Алдаа гарлаа",
                description: "Мэдээллийг хадгалахад алдаа гарлаа. Дараа дахин оролдоно уу.",
            });
          }
      }
  };

  const logout = async () => {
    try {
        await signOut(auth);
        toast({
            title: "Системээс гарлаа",
            description: "Та амжилттай системээс гарлаа.",
        });
        router.push('/');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Гарахад алдаа гарлаа",
            description: error.message,
        });
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userEmail, hotelInfo, login, register, logout, isLoading, updateHotelInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
