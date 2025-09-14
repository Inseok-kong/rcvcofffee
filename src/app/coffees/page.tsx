'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { coffeeService } from '@/services/firebaseService';
import { CoffeeCard } from '@/components/coffees/CoffeeCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export default function CoffeesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, coffees, setCoffees } = useCoffeeStore();
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // 인증 체크
  const { isReady } = useAuth();

  const loadCoffees = useCallback(async () => {
    if (!user || coffees.length > 0) return; // 이미 데이터가 있으면 로딩하지 않음
    
    setIsLoadingData(true);
    try {
      const coffeesData = await coffeeService.getCoffees();
      setCoffees(coffeesData);
    } catch (error) {
      console.error('커피 데이터 로딩 오류:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, setCoffees, coffees.length]);

  // 인증 체크는 useAuth 훅에서 처리됨

  useEffect(() => {
    if (isAuthenticated && user && coffees.length === 0) {
      loadCoffees();
    }
  }, [isAuthenticated, user, loadCoffees]);

  const handleDeleteCoffee = async (coffeeId: string) => {
    if (!user) return;
    
    try {
      await coffeeService.deleteCoffee(coffeeId);
      setCoffees(coffees.filter(coffee => coffee.id !== coffeeId));
    } catch (error) {
      console.error('커피 삭제 오류:', error);
    }
  };

  const handleAddCoffee = () => {
    console.log('커피 추가 버튼 클릭');
    router.push('/coffees/new');
  };

  if (isLoading || isLoadingData || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">커피 관리</h1>
            <p className="mt-2 text-gray-600">
              보유하고 있는 커피 원두를 관리하세요
            </p>
          </div>
          <button
            onClick={handleAddCoffee}
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            커피 추가
          </button>
        </div>

        {/* 커피 목록 */}
        {coffees.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PlusIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              아직 등록된 커피가 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              첫 번째 커피를 추가해보세요
            </p>
            <button
              onClick={handleAddCoffee}
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              커피 추가하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coffees.map((coffee) => (
              <CoffeeCard
                key={coffee.id}
                coffee={coffee}
                onDelete={handleDeleteCoffee}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
