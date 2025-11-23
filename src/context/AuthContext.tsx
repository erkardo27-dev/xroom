

"use client";

import { Amenity } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useUser, useAuth as useFirebaseAuth } from "@/firebase";
import { signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

type HotelInfo = {
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
  register: (email: string, password: string, hotelData: Omit<HotelInfo, 'amenities' | 'galleryImageIds' | 'detailedAddress' | 'latitude' | 'longitude'>) => Promise<void>;
  logout: () => Promise<void>;
  updateHotelInfo: (hotelInfo: Partial<HotelInfo>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const isLoggedIn = !!user;
  const userEmail = user?.email || null;

  useEffect(() => {
    setIsLoading(isUserLoading);
    if (!isUserLoading && user) {
        // In a real app, you would fetch hotel info from Firestore based on user.uid
        // For now, we'll continue to use localStorage for hotelInfo persistence
        try {
            const savedHotelInfo = localStorage.getItem(`hotelInfo_${user.uid}`);
            if (savedHotelInfo) {
                setHotelInfo(JSON.parse(savedHotelInfo));
            }
        } catch (error) {
            console.warn("Could not read hotel info from localStorage", error);
        }
    } else if (!isUserLoading && !user) {
        setHotelInfo(null);
    }
  }, [user, isUserLoading]);


  const login = async (email: string, password?: string) => {
    try {
        if (password) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            // This is for the anonymous login flow from the original code
            // This might need adjustment based on final auth strategy
            await signInAnonymously(auth); 
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
            description: error.message,
        });
    }
  };

  const register = async (email: string, password: string, hotelData: Omit<HotelInfo, 'amenities' | 'galleryImageIds' | 'detailedAddress' | 'latitude' | 'longitude'>) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fullHotelInfo: HotelInfo = {
            ...hotelData,
            detailedAddress: '',
            amenities: [],
            galleryImageIds: [],
        };
        setHotelInfo(fullHotelInfo);
        localStorage.setItem(`hotelInfo_${userCredential.user.uid}`, JSON.stringify(fullHotelInfo));
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
  
  const updateHotelInfo = (newHotelInfo: Partial<HotelInfo>) => {
      if (user) {
          const updatedHotelInfo = { ...(hotelInfo || {}), ...newHotelInfo } as HotelInfo;
          setHotelInfo(updatedHotelInfo);
          localStorage.setItem(`hotelInfo_${user.uid}`, JSON.stringify(updatedHotelInfo));
           toast({
                title: "Амжилттай",
                description: "Зочид буудлын мэдээлэл шинэчлэгдлээ.",
            });
      }
  };

  const logout = async () => {
    try {
        await signOut(auth);
        setHotelInfo(null);
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
