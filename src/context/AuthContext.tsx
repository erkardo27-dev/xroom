
"use client";

import { Amenity } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from 'next/navigation';

type HotelInfo = {
    hotelName: string;
    location: string;
    phoneNumber: string;
    amenities?: Amenity[];
    galleryImageIds?: string[];
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  userEmail: string | null;
  hotelInfo: HotelInfo | null;
  isLoading: boolean;
  login: (email: string, hotelInfo: HotelInfo) => Promise<void>;
  logout: () => Promise<void>;
  updateHotelInfo: (hotelInfo: HotelInfo) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    try {
        const savedUser = localStorage.getItem('authUser');
        if (savedUser) {
            const { email, hotel } = JSON.parse(savedUser);
            setUserEmail(email);
            setHotelInfo(hotel);
            setIsLoggedIn(true);
        }
    } catch (error) {
        console.warn("Could not read from localStorage");
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, hotel: HotelInfo) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setHotelInfo(hotel);
    localStorage.setItem('authUser', JSON.stringify({ email, hotel }));
    toast({
        title: "Амжилттай нэвтэрлээ",
        description: `${hotel.hotelName}-д тавтай морилно уу.`,
    });
    router.push('/dashboard');
    router.refresh();
  };
  
  const updateHotelInfo = (newHotelInfo: HotelInfo) => {
      if (isLoggedIn && userEmail) {
          setHotelInfo(newHotelInfo);
          localStorage.setItem('authUser', JSON.stringify({ email: userEmail, hotel: newHotelInfo }));
           toast({
                title: "Амжилттай",
                description: "Зочид буудлын мэдээлэл шинэчлэгдлээ.",
            });
      }
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUserEmail(null);
    setHotelInfo(null);
    localStorage.removeItem('authUser');
    toast({
        title: "Системээс гарлаа",
        description: "Та амжилттай системээс гарлаа.",
    });
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userEmail, hotelInfo, login, logout, isLoading, updateHotelInfo }}>
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
