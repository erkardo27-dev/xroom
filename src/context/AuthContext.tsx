

"use client";

import { Amenity } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from 'next/navigation';

type HotelInfo = {
    hotelName: string;
    location: string;
    detailedAddress?: string;
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
  login: (email: string, hotelInfo: Omit<HotelInfo, 'amenities' | 'galleryImageIds' | 'detailedAddress'>) => Promise<void>;
  logout: () => Promise<void>;
  updateHotelInfo: (hotelInfo: Partial<HotelInfo>) => void;
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

  const login = async (email: string, hotel: Omit<HotelInfo, 'amenities' | 'galleryImageIds' | 'detailedAddress'>) => {
    const fullHotelInfo: HotelInfo = {
        ...hotel,
        detailedAddress: '',
        amenities: [],
        galleryImageIds: [],
    };
    setIsLoggedIn(true);
    setUserEmail(email);
    setHotelInfo(fullHotelInfo);
    localStorage.setItem('authUser', JSON.stringify({ email, hotel: fullHotelInfo }));
    toast({
        title: "Амжилттай нэвтэрлээ",
        description: `${hotel.hotelName}-д тавтай морилно уу.`,
    });
    router.push('/dashboard');
    router.refresh();
  };
  
  const updateHotelInfo = (newHotelInfo: Partial<HotelInfo>) => {
      if (isLoggedIn && userEmail && hotelInfo) {
          const updatedHotelInfo = { ...hotelInfo, ...newHotelInfo };
          setHotelInfo(updatedHotelInfo);
          localStorage.setItem('authUser', JSON.stringify({ email: userEmail, hotel: updatedHotelInfo }));
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

// This allows accessing the state outside of React components if needed
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const getAuthState = () => {
    const context = useContext(AuthContext);
    return context || { hotelInfo: null }; // Provide a default for non-React contexts
}

useAuth.getState = getAuthState;

export { useAuth };

    