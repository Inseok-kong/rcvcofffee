'use client';

import { useEffect, useRef } from 'react';
import { authService } from '@/services/authService';
import { useCoffeeStore } from '@/store/useStore';
import { User } from '@/types';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading, user, isAuthenticated, isLoading } = useCoffeeStore();
  const isInitialized = useRef(false);
  const authStateUnsubscribe = useRef<(() => void) | null>(null);

  useEffect(() => {
    // 이미 초기화되었으면 중복 실행 방지
    if (isInitialized.current) {
      console.log('AuthProvider: 이미 초기화됨, 중복 실행 방지');
      return;
    }

    console.log('AuthProvider: 초기화 시작');
    
    // Firebase Auth 상태 변경 감지
    authStateUnsubscribe.current = authService.onAuthStateChanged((user: User | null) => {
      console.log('Firebase Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
      
      // 사용자 상태 업데이트 (setUser에서 isLoading도 false로 설정됨)
      setUser(user);
      
      // 초기 로딩 완료 표시
      if (!isInitialized.current) {
        isInitialized.current = true;
        console.log('AuthProvider: 초기 로딩 완료, isAuthenticated:', !!user);
        // 명시적으로 로딩 상태를 false로 설정
        setLoading(false);
      }
    });

    return () => {
      if (authStateUnsubscribe.current) {
        authStateUnsubscribe.current();
        authStateUnsubscribe.current = null;
      }
    };
  }, [setUser]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      isInitialized.current = false;
      if (authStateUnsubscribe.current) {
        authStateUnsubscribe.current();
        authStateUnsubscribe.current = null;
      }
    };
  }, []);

  // 디버깅을 위한 상태 로깅
  useEffect(() => {
    console.log('AuthProvider 상태:', {
      user: user ? `${user.email} (${user.uid})` : 'null',
      isAuthenticated,
      isLoading,
      isInitialized: isInitialized.current
    });
  }, [user, isAuthenticated, isLoading]);

  return <>{children}</>;
}
