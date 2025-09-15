'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';

export function useAuth(redirectTo: string = '/login') {
  const { user, isAuthenticated, isLoading } = useCoffeeStore();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const lastAuthState = useRef<{ isAuthenticated: boolean; userId: string | null }>({
    isAuthenticated: false,
    userId: null
  });

  useEffect(() => {
    // 로딩 중이면 아무것도 하지 않음
    if (isLoading) {
      console.log('useAuth: 로딩 중...');
      return;
    }

    // 인증 상태가 실제로 변경되었을 때만 처리
    const currentAuthState = {
      isAuthenticated: !!isAuthenticated && !!user,
      userId: user?.uid || null
    };

    console.log('useAuth: 현재 인증 상태 체크', {
      isAuthenticated: currentAuthState.isAuthenticated,
      userId: currentAuthState.userId,
      hasRedirected: hasRedirected.current
    });

    // 상태가 변경되지 않았으면 아무것도 하지 않음
    if (
      lastAuthState.current.isAuthenticated === currentAuthState.isAuthenticated &&
      lastAuthState.current.userId === currentAuthState.userId
    ) {
      return;
    }

    lastAuthState.current = currentAuthState;

    // 인증되지 않은 경우에만 리다이렉트
    if (!currentAuthState.isAuthenticated) {
      if (!hasRedirected.current) {
        console.log('useAuth: 인증되지 않은 사용자 - 리다이렉트:', redirectTo);
        hasRedirected.current = true;
        router.push(redirectTo);
      }
    } else {
      console.log('useAuth: 인증된 사용자 확인됨:', user?.email);
      hasRedirected.current = false; // 인증된 경우 리다이렉트 플래그 리셋
    }
  }, [isAuthenticated, user, isLoading, router, redirectTo]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isReady: !isLoading // 로딩이 완료되면 준비됨
  };
}
