'use client';

import { useEffect } from 'react';
import { authService } from '@/services/authService';
import { useCoffeeStore } from '@/store/useStore';
import { User } from '@/types';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading } = useCoffeeStore();

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = authService.onAuthStateChanged((user: User | null) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
