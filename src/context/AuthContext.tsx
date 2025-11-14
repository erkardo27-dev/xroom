"use client";

import { useToast } from "@/hooks/use-toast";
import { createContext, useContext, useState, ReactNode } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();

  const login = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    toast({
        title: "Амжилттай нэвтэрлээ",
        description: `${email} хаягаар нэвтэрлээ.`,
    });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserEmail(null);
    toast({
        title: "Системээс гарлаа",
        description: "Та амжилттай системээс гарлаа.",
    });
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userEmail, login, logout }}>
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
