
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { useFirebaseApp } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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
  register: (
    email: string,
    password: string,
    hotelData: Omit<HotelInfo, "id" | "amenities" | "galleryImageUrls">
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateHotelInfo: (data: Partial<Omit<HotelInfo, 'id'>>) => Promise<void>;
  userEmail: string | null;
  userUid: string | null;
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

  // AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // HOTEL INFO LISTENER
  useEffect(() => {
    if (user) {
      const ref = doc(firestore, "hotels", user.uid);
      const unsubscribe = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          setHotelInfo(snap.data() as HotelInfo);
        } else {
          setHotelInfo(null);
        }
      });
      return () => unsubscribe();
    } else {
      setHotelInfo(null);
    }
  }, [user, firestore]);


  // LOGIN + REDIRECT
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
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

  // REGISTER
  const register = async (
    email: string,
    password: string,
    hotelData: Omit<HotelInfo, "id" | "amenities" | "galleryImageUrls">
  ) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const newHotelData: HotelInfo = {
        ...hotelData,
        id: user.uid,
        amenities: [],
        galleryImageUrls: [],
      };

      await setDoc(doc(firestore, "hotels", user.uid), newHotelData);
      router.push("/dashboard");
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

  // UPDATE HOTEL INFO
  const updateHotelInfo = async (data: Partial<Omit<HotelInfo, 'id'>>) => {
    if (!user) return;
    const ref = doc(firestore, "hotels", user.uid);
    
    const dataToSave = { ...data };
    delete (dataToSave as any).termsAccepted;
    
    if (data.termsAccepted && !hotelInfo?.contractSignedOn) {
        dataToSave.contractSignedOn = new Date().toISOString();
    }

    try {
        await setDoc(ref, dataToSave, { merge: true });
        toast({
            title: "Амжилттай хадгалагдлаа",
            description: "Таны буудлын мэдээлэл шинэчлэгдлээ.",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Хадгалахад алдаа гарлаа",
            description: error.message,
        });
    }
  };


  // LOGOUT
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

  const isAdmin = user?.email === "admin@xroom.com";

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
        userUid: user?.uid ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

    