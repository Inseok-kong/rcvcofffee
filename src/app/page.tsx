'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useCoffeeStore } from '@/store/useStore';
import { coffeeService, consumptionService, recipeService } from '@/services/firebaseService';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentRecipes } from '@/components/dashboard/RecentRecipes';
import { CoffeeInventory } from '@/components/dashboard/CoffeeInventory';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    coffees, 
    recipes, 
    setCoffees, 
    setRecipes, 
    setConsumptions,
    getTodayConsumption,
    getTotalWeight 
  } = useCoffeeStore();
  
  // 인증 체크
  const { isReady } = useAuth();
  const dataLoaded = useRef(false);

  const loadData = useCallback(async () => {
    if (!user || dataLoaded.current) return;

    // 이미 데이터가 있으면 로딩하지 않음
    if (coffees.length > 0 && recipes.length > 0) {
      dataLoaded.current = true;
      return;
    }

    try {
      console.log('데이터 로딩 시작');
      const [coffeesData, recipesData, consumptionsData] = await Promise.all([
        coffeeService.getCoffees(),
        recipeService.getRecipes(),
        consumptionService.getConsumptions(10),
      ]);

      setCoffees(coffeesData);
      setRecipes(recipesData);
      setConsumptions(consumptionsData);
      dataLoaded.current = true;
      console.log('데이터 로딩 완료');
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
    }
  }, [user, setCoffees, setRecipes, setConsumptions, coffees.length, recipes.length]);

  useEffect(() => {
    if (isAuthenticated && user && isReady && !dataLoaded.current) {
      loadData();
    }
  }, [isAuthenticated, user, isReady, loadData]);

  // 로딩 중이거나 인증되지 않은 경우에만 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 인증되지 않은 경우 useAuth에서 리다이렉트 처리
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const todayConsumption = getTodayConsumption();
  const totalWeight = getTotalWeight();
  const recentRecipes = recipes.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-amber-600 mb-2">
              RCV@UOS Coffee관리 앱입니다
            </h1>
            <div className="w-16 h-1 bg-amber-600 mx-auto rounded-full"></div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            안녕하세요, {user?.displayName || '사용자'}님! ☕
          </h2>
          <p className="mt-2 text-gray-600 text-center">
            오늘도 좋은 커피 한 잔 어떠세요?
          </p>
        </div>

        {/* 통계 카드 */}
        <DashboardStats 
          todayConsumption={todayConsumption}
          totalCoffees={coffees.length}
          totalWeight={totalWeight}
        />

        {/* 빠른 액션 */}
        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* 최근 레시피 */}
          <RecentRecipes recipes={recentRecipes} />

          {/* 커피 재고 */}
          <CoffeeInventory coffees={coffees} />
        </div>
      </div>
    </div>
  );
}