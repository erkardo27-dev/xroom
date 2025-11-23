'use client';
    
import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useAuth } from '@/firebase';

export interface UserAuthHookResult {
  user: User | null;
  isUserLoading: boolean;
}

/**
 * A custom hook to get the current authenticated user from Firebase.
 *
 * @returns {UserAuthHookResult} An object containing the user and loading state.
 */
export const useUser = (): UserAuthHookResult => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setUserLoading] = useState(true);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setUserLoading(false);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } else {
      // If auth is not available, stop loading and set user to null.
      setUserLoading(false);
    }
  }, [auth]);

  return { user, isUserLoading };
};
