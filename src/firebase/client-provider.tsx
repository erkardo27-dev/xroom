'use client';

import React, { type ReactNode } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

// Initialize Firebase only if it hasn't been initialized yet
if (typeof window !== 'undefined' && !getApps().length) {
  initializeApp(firebaseConfig);
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider>
      {children}
    </FirebaseProvider>
  );
}
