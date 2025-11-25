'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
        initializeApp(firebaseConfig);
    } catch (e) {
        // App is already initialized, which is fine.
        console.log("Firebase already initialized");
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <FirebaseProvider>
      {children}
    </FirebaseProvider>
  );
}
