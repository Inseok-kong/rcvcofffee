'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { authService } from '@/services/authService';
import {
  HomeIcon,
  BookOpenIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { CoffeeIcon } from '@/components/ui/CustomIcon';

const navigationItems = [
  { name: '대시보드', href: '/', icon: HomeIcon },
  { name: '커피 관리', href: '/coffees', icon: CoffeeIcon },
  { name: '레시피', href: '/recipes', icon: BookOpenIcon },
  { name: '소비 기록', href: '/consumption', icon: ChartBarIcon },
  { name: '마이페이지', href: '/mypage', icon: UserIcon },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, setUser } = useCoffeeStore();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      // 페이지 새로고침으로 상태 완전 초기화
      window.location.href = '/login';
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 오류가 발생해도 로그인 페이지로 이동
      window.location.href = '/login';
    }
  };

  const handleNavigationClick = (e: React.MouseEvent, href: string) => {
    console.log('Navigation click:', { href, isAuthenticated, isLoading });
    
    // 로딩 중이면 아무것도 하지 않음
    if (isLoading) {
      console.log('로딩 중이므로 네비게이션 클릭 무시');
      e.preventDefault();
      return;
    }
    
    // 인증 상태가 명확하지 않은 경우 (로딩 중이거나 인증되지 않은 경우)
    if (!isAuthenticated) {
      console.log('인증되지 않은 상태에서 네비게이션 클릭');
      e.preventDefault();
      router.push('/login');
      return;
    }
    
    // 인증된 경우 정상적으로 네비게이션 허용
    console.log('인증된 사용자 - 네비게이션 허용');
  };

  // 로딩 중이거나 인증되지 않은 경우 네비게이션 숨김
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavigationClick(e, item.href)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors text-gray-600 hover:text-red-600 hover:bg-red-50"
          title="로그아웃"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
          <span className="text-xs mt-1 font-medium">로그아웃</span>
        </button>
      </div>
    </nav>
  );
}
