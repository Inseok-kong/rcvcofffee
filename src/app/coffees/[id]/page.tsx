'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCoffeeStore } from '@/store/useStore';
import { coffeeService } from '@/services/firebaseService';
import { Coffee } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  ArrowLeftIcon, 
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { CoffeeIcon } from '@/components/ui/CustomIcon';
import { HomeButton } from '@/components/ui/HomeButton';

export default function CoffeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useCoffeeStore();
  const [coffee, setCoffee] = useState<Coffee | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const coffeeId = typeof params.id === 'string' ? params.id : null;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const loadCoffee = useCallback(async () => {
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

  const isLowStock = () => {
    if (!coffee) return false;
    return getWeightPercentage() < 20;
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

  if (!isAuthenticated || !coffee) {
    return null;
  }

  const weightPercentage = getWeightPercentage();
  const isLow = isLowStock();
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
            {/* 컵노트 */}
            {coffee.cupNotes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">컵노트</span>
                </div>
                <p className="text-sm text-gray-600">{coffee.cupNotes}</p>
              </div>
            )}

            {/* 로스팅 포인트 */}
            {coffee.roastingPoint && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">로스팅 포인트</span>
                </div>
                <p className="text-sm text-gray-600">{coffee.roastingPoint}</p>
              </div>
            )}

            {/* 국가 */}
            {coffee.country && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">국가</span>
                </div>
                <p className="text-sm text-gray-600">{coffee.country}</p>
              </div>
            )}

            {/* 지역 */}
            {coffee.region && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">지역</span>
                </div>
                <p className="text-sm text-gray-600">{coffee.region}</p>
              </div>
            )}

            {/* 농장 */}
            {coffee.farm && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">농장</span>
                </div>
                <p className="text-sm text-gray-600">{coffee.farm}</p>
              </div>
            )}

            {/* 품종 */}
            {coffee.variety && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">품종</span>
                </div>
                <p className="text-sm text-gray-600">{coffee.variety}</p>
              </div>
            )}

            {/* 고도 */}
            {coffee.altitude && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">고도</span>
                </div>
                <p className="text-sm text-gray-600">{coffee.altitude}</p>
              </div>
            )}

            {/* 가공방식 */}
            {coffee.processingMethod && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">가공방식</span>
                </div>
                <p className="text-sm text-gray-600">{coffee.processingMethod}</p>
              </div>
            )}

            {/* 감각적 특성 */}
            {(coffee.acidity || coffee.body || coffee.fermentation) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  {coffee.acidity && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">산미</span>
                        <span className="text-sm text-gray-600">{coffee.acidity}/5</span>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-full ${
                              i < coffee.acidity! ? 'bg-amber-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {coffee.body && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">바디감</span>
                        <span className="text-sm text-gray-600">{coffee.body}/5</span>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-full ${
                              i < coffee.body! ? 'bg-amber-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {coffee.fermentation && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">발효도</span>
                        <span className="text-sm text-gray-600">{coffee.fermentation}/5</span>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-full ${
                              i < coffee.fermentation! ? 'bg-amber-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
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
                  <p className="text-sm text-gray-600">Special Single Origin</p>
                  <h2 className="text-2xl font-bold text-gray-900 mt-2">
                    {coffee.country?.toUpperCase() || 'COFFEE'}
                  </h2>
                </div>
                
                <div className="text-sm text-gray-700">
                  {coffee.farm && coffee.variety && (
                    <p>{coffee.farm} {coffee.variety}</p>
                  )}
                  {coffee.processingMethod && (
                    <div className="mt-2">
                      <div className="w-full h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">{coffee.processingMethod}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {coffee.cupNotes && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">{coffee.cupNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Link
                href={`/consumption/quick?coffeeId=${coffee.id}`}
                className="w-full bg-amber-600 text-white py-4 px-6 rounded-md hover:bg-amber-700 transition-colors text-center block font-medium text-lg"
              >
                {coffee.currentWeight}g 상품 추가하기
              </Link>
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