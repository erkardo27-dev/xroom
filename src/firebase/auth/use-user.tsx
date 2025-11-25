'use client';
    
import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User, getAuth } from 'firebase/auth';

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
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setUserLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, isUserLoading };
};
