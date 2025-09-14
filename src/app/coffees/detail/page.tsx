'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { coffeeService } from '@/services/firebaseService';
import { Coffee } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { HomeButton } from '@/components/ui/HomeButton';

function CoffeeDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useCoffeeStore();
  const [coffee, setCoffee] = useState<Coffee | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const coffeeId = searchParams.get('id');

  useEffect(() => {
    // 로딩이 완료되었고, 명확히 인증되지 않은 경우에만 리다이렉트
    if (isLoading === false && isAuthenticated === false && user === null) {
      console.log('인증되지 않은 사용자 - 로그인 페이지로 리다이렉트');
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  const loadCoffee = useCallback(async () => {
    if (!coffeeId) {
      router.push('/coffees');
      return;
    }
    
    setIsLoadingData(true);
    try {
      const coffees = await coffeeService.getCoffees();
      const foundCoffee = coffees.find(c => c.id === coffeeId);
      if (foundCoffee) {
        setCoffee(foundCoffee);
      } else {
        router.push('/coffees');
      }
    } catch (error) {
      console.error('커피 데이터 로딩 오류:', error);
      router.push('/coffees');
    } finally {
      setIsLoadingData(false);
    }
  }, [coffeeId, router]);

  useEffect(() => {
    if (isAuthenticated && user && coffeeId) {
      loadCoffee();
    }
  }, [isAuthenticated, user, coffeeId, loadCoffee]);

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      'single-origin': '싱글오리진',
      'blend': '블렌드',
      'espresso': '에스프레소',
      'filter': '필터',
    };
    return names[type] || type;
  };

  const getWeightPercentage = () => {
    if (!coffee) return 0;
    return (coffee.currentWeight / coffee.weight) * 100;
  };

  const isExpiringSoon = () => {
    if (!coffee || !coffee.expiryDate) return false;
    const today = new Date();
    const expiryDate = new Date(coffee.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 디버깅을 위한 정보 표시
  console.log('Rendering coffee detail page:', { isLoading, isAuthenticated, user: !!user, coffee: !!coffee });

  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">인증이 필요합니다.</p>
          <p className="text-sm text-gray-600 mb-4">
            isLoading: {isLoading.toString()}, 
            isAuthenticated: {isAuthenticated.toString()}, 
            user: {user ? 'exists' : 'null'}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  if (!coffee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">커피 정보를 불러오는 중...</p>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const weightPercentage = getWeightPercentage();
  const isExpiring = isExpiringSoon();

  return (
    <div className="min-h-screen bg-amber-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-amber-200 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{coffee.name}</h1>
              <p className="mt-2 text-amber-200">
                {coffee.brand && `${coffee.brand} • `}
                {getTypeName(coffee.type)}
              </p>
            </div>
          </div>
          <HomeButton size="md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽 패널 - 상세 정보 */}
          <div className="space-y-4">
            {/* 상세 정보 */}
            {coffee.details && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">상세 정보</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-gray-900 font-mono text-sm leading-relaxed">
                    {coffee.details}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 패널 - 요약 및 액션 */}
          <div className="space-y-6">
            {/* 요약 박스 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm text-gray-600">{getTypeName(coffee.type)}</p>
                  <h2 className="text-2xl font-bold text-gray-900 mt-2">
                    {coffee.name.toUpperCase()}
                  </h2>
                  {coffee.brand && (
                    <p className="text-sm text-gray-600 mt-1">{coffee.brand}</p>
                  )}
                </div>
                
                {coffee.price && (
                  <div className="mt-4">
                    <p className="text-lg font-semibold text-amber-600">
                      ₩{coffee.price.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>


            {/* 재고 정보 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">재고 정보</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">남은 무게</span>
                  <span className="text-sm font-medium text-gray-900">
                    {coffee.currentWeight}g / {coffee.weight}g
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      weightPercentage > 50 
                        ? 'bg-green-500' 
                        : weightPercentage > 20 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(weightPercentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{weightPercentage.toFixed(1)}% 남음</span>
                  {coffee.expiryDate && (
                    <span>
                      {isExpiring ? '곧 만료' : '유통기한 있음'}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">구매일</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(coffee.purchaseDate).toLocaleDateString()}
                  </span>
                </div>
                
                {coffee.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">만료일</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(coffee.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoffeeDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <CoffeeDetailContent />
    </Suspense>
  );
}
