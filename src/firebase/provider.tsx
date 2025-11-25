"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { FirebaseApp, getApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { Auth, getAuth } from "firebase/auth";
import { FirebaseStorage, getStorage } from "firebase/storage";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";

interface FirebaseProviderProps {
  children: ReactNode;
}

interface FirebaseContextValue {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider = ({ children }: FirebaseProviderProps) => {
  const app = getApp();
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);

  return (
    <FirebaseContext.Provider value={{ firebaseApp: app, firestore, auth, storage }}>
      {children}
      <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error("useFirebase must be used within a FirebaseProvider");
  return context;
};

export const useFirebaseApp = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error("useFirebaseApp must be used within a FirebaseProvider");
  return context.firebaseApp;
}

export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error("useFirestore must be used within a FirebaseProvider");
  return context.firestore;
}

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error("useAuth must be used within a FirebaseProvider");
  return context.auth;
}

export const useStorage = () => {
    const context = useContext(FirebaseContext);
    if (!context) throw new Error("useStorage must be used within a FirebaseProvider");
    return context.storage;
}

export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const result = React.useMemo(factory, deps);
  if(result) {
    (result as any).__memo = true;
  }
  return result;
}
