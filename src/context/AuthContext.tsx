
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useFirebaseApp } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

export interface HotelInfo {
    id: string;
    hotelName: string;
    location: string;
    phoneNumber: string;
    amenities: string[];
    galleryImageUrls: string[];
    detailedAddress?: string;
    latitude?: number;
    longitude?: number;
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    contractSignedOn?: string;
    signatureName?: string;
}

interface AuthContextType {
  user: User | null;
  hotelInfo: HotelInfo | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, hotelData: Omit<HotelInfo, 'id' | 'amenities' | 'galleryImageUrls' >) => Promise<void>;
  logout: () => Promise<void>;
  updateHotelInfo: (data: Partial<HotelInfo>) => Promise<void>;
  userEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const app = useFirebaseApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const { toast } = useToast();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const ref = doc(firestore, "hotels", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            setHotelInfo(snap.data() as HotelInfo);
        }
      } else {
        setHotelInfo(null);
      }
      setIsLoading(false); // Set loading to false once auth state is determined
    });
    return () => unsubscribe();
  }, [auth, firestore]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Нэвтрэхэд алдаа гарлаа",
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, hotelData: Omit<HotelInfo, 'id' | 'amenities' | 'galleryImageUrls'>) => {
    setIsLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const newHotelData = {
            ...hotelData,
            id: user.uid,
            amenities: [],
            galleryImageUrls: [],
        };
        await setDoc(doc(firestore, "hotels", user.uid), newHotelData);
        setHotelInfo(newHotelData);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Бүртгүүлэхэд алдаа гарлаа",
            description: error.message,
        });
        throw error;
    } finally {
        setIsLoading(false);
    }
  };
  
  const updateHotelInfo = async (data: Partial<HotelInfo>) => {
    if (!user) return;
    const ref = doc(firestore, "hotels", user.uid);
    
    // Create a copy of the data and remove any undefined fields
    const cleanedData: Partial<HotelInfo> = {};
    for (const key in data) {
        if (data[key as keyof typeof data] !== undefined) {
            cleanedData[key as keyof typeof data] = data[key as keyof typeof data];
        } else {
            cleanedData[key as keyof typeof data] = null as any;
        }
    }

    try {
      await updateDoc(ref, cleanedData);
      setHotelInfo((prev) => ({ ...prev, ...cleanedData } as HotelInfo));
       toast({
        title: "Амжилттай хадгаллаа!",
        description: "Таны буудлын мэдээлэл амжилттай шинэчлэгдлээ.",
      });
    } catch(error: any) {
      toast({
          variant: "destructive",
          title: "Хадгалахад алдаа гарлаа",
          description: error.message,
      });
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      router.push('/');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Гарахад алдаа гарлаа",
            description: error.message,
        });
        throw error;
    } finally {
        setIsLoading(false);
    }
  };
  
  const isAdmin = user?.email === 'admin@xroom.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        hotelInfo,
        isLoggedIn: !!user,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        updateHotelInfo,
        userEmail: user?.email ?? null,
      }}
    >
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
