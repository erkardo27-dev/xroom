"use client";

import { useToast } from "@/hooks/use-toast";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from 'next/navigation';

type AuthContextType = {
  isLoggedIn: boolean;
  userEmail: string | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check for saved session on initial load
    try {
        const savedUser = localStorage.getItem('userEmail');
        if (savedUser) {
            setUserEmail(savedUser);
            setIsLoggedIn(true);
        }
    } catch (error) {
        console.warn("Could not read from localStorage");
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    localStorage.setItem('userEmail', email);
    toast({
        title: "Амжилттай нэвтэрлээ",
        description: `${email} хаягаар нэвтэрлээ.`,
    });
    router.push('/dashboard');
    router.refresh();
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUserEmail(null);
    localStorage.removeItem('userEmail');
    toast({
        title: "Системээс гарлаа",
        description: "Та амжилттай системээс гарлаа.",
    });
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userEmail, login, logout, isLoading }}>
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
