'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { coffeeService } from '@/services/firebaseService';
import { Coffee } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { HomeButton } from '@/components/ui/HomeButton';
import { 
  ArrowLeftIcon, 
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { CoffeeIcon } from '@/components/ui/CustomIcon';

export default function CoffeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useCoffeeStore();
  const [coffee, setCoffee] = useState<Coffee | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const coffeeId = params.id as string;

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

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'single-origin': 'bg-green-100 text-green-800',
      'blend': 'bg-blue-100 text-blue-800',
      'espresso': 'bg-red-100 text-red-800',
      'filter': 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

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
    return getWeightPercentage() < 20;
  };

  const isExpiringSoon = () => {
    if (!coffee?.expiryDate) return false;
    const today = new Date();
    const expiryDate = new Date(coffee.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const renderRatingBar = (value: number, label: string) => {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 w-16">{label}</span>
        <div className="flex-1 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${
                i <= value ? 'bg-amber-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 w-8">{value}/5</span>
      </div>
    );
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{coffee.name}</h1>
              <p className="mt-2 text-gray-600">
                {coffee.brand && `${coffee.brand} • `}
                {getTypeName(coffee.type)}
              </p>
            </div>
          </div>
          <HomeButton size="md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 카드 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{coffee.name}</h2>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(coffee.type)}`}>
                      {getTypeName(coffee.type)}
                    </span>
                  </div>
                  {coffee.brand && (
                    <p className="text-gray-600 mb-2">{coffee.brand}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {isLow && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" title="재고 부족" />
                  )}
                  {isExpiring && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" title="곧 만료" />
                  )}
                </div>
              </div>

              {/* 무게 정보 */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>남은 무게</span>
                  <span className="font-medium">
                    {coffee.currentWeight}g / {coffee.weight}g
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      weightPercentage > 50 
                        ? 'bg-green-500' 
                        : weightPercentage > 20 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(weightPercentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{weightPercentage.toFixed(1)}% 남음</span>
                  {coffee.expiryDate && (
                    <span>
                      {isExpiring ? '곧 만료' : '유통기한 있음'}
                    </span>
                  )}
                </div>
              </div>

              {/* 날짜 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">구매일:</span>
                  <span className="font-medium">{new Date(coffee.purchaseDate).toLocaleDateString('ko-KR')}</span>
                </div>
                {coffee.expiryDate && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">만료일:</span>
                    <span className="font-medium">{new Date(coffee.expiryDate).toLocaleDateString('ko-KR')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 상세 정보 카드 */}
            {(coffee.description || coffee.cupNotes || coffee.country || coffee.region || coffee.farm || coffee.variety || coffee.altitude || coffee.processingMethod || coffee.roastingPoint) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">상세 정보</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coffee.country && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">국가:</span>
                      <span className="font-medium">{coffee.country}</span>
                    </div>
                  )}
                  
                  {coffee.region && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">지역:</span>
                      <span className="font-medium">{coffee.region}</span>
                    </div>
                  )}
                  
                  {coffee.farm && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">농장:</span>
                      <span className="font-medium">{coffee.farm}</span>
                    </div>
                  )}
                  
                  {coffee.variety && (
                    <div className="flex items-center gap-2">
                      <CoffeeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">품종:</span>
                      <span className="font-medium">{coffee.variety}</span>
                    </div>
                  )}
                  
                  {coffee.altitude && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">고도:</span>
                      <span className="font-medium">{coffee.altitude}</span>
                    </div>
                  )}
                  
                  {coffee.processingMethod && (
                    <div className="flex items-center gap-2">
                      <CoffeeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">가공방식:</span>
                      <span className="font-medium">{coffee.processingMethod}</span>
                    </div>
                  )}
                  
                  {coffee.roastingPoint && (
                    <div className="flex items-center gap-2">
                      <CoffeeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">로스팅 포인트:</span>
                      <span className="font-medium">{coffee.roastingPoint}</span>
                    </div>
                  )}
                </div>

                {coffee.description && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">설명</h4>
                    <p className="text-gray-600 leading-relaxed">{coffee.description}</p>
                  </div>
                )}

                {coffee.cupNotes && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">컵노트</h4>
                    <p className="text-gray-600 leading-relaxed">{coffee.cupNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* 감각적 특성 */}
            {(coffee.acidity || coffee.body || coffee.fermentation) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">감각적 특성</h3>
                
                <div className="space-y-4">
                  {coffee.acidity && renderRatingBar(coffee.acidity, '산미')}
                  {coffee.body && renderRatingBar(coffee.body, '바디감')}
                  {coffee.fermentation && renderRatingBar(coffee.fermentation, '발효도')}
                </div>
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 액션 카드 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">액션</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/consumption/quick?coffeeId=${coffee.id}`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <CoffeeIcon className="h-5 w-5" />
                  소비 기록하기
                </button>
                
                <button
                  onClick={() => router.push('/coffees')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  재고 목록으로
                </button>
              </div>
            </div>

            {/* 상태 알림 */}
            {(isLow || isExpiring) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">알림</h3>
                
                <div className="space-y-3">
                  {isLow && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-red-800">재고 부족</p>
                        <p className="text-xs text-red-600">재고가 20% 미만입니다</p>
                      </div>
                    </div>
                  )}
                  
                  {isExpiring && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">곧 만료</p>
                        <p className="text-xs text-yellow-600">7일 이내에 만료됩니다</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
