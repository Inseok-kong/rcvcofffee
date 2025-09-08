'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { consumptionService, coffeeService } from '@/services/firebaseService';
import { ConsumptionCard } from '@/components/consumption/ConsumptionCard';
import { ConsumptionCalendar } from '@/components/consumption/ConsumptionCalendar';
import { SelectedDateConsumption } from '@/components/consumption/SelectedDateConsumption';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PlusIcon, ChartBarIcon, CalendarIcon, ListBulletIcon } from '@heroicons/react/24/outline';

export default function ConsumptionPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, consumptions, setConsumptions, coffees, updateCoffee } = useCoffeeStore();
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const loadConsumptions = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingData(true);
    try {
      // 달력 뷰에서는 모든 소비 기록을 로드
      const consumptionsData = await consumptionService.getConsumptions(100);
      setConsumptions(consumptionsData);
      console.log('소비 기록 로드됨:', consumptionsData.length, '개');
    } catch (error) {
      console.error('소비 기록 데이터 로딩 오류:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, setConsumptions]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadConsumptions();
    }
  }, [isAuthenticated, user, selectedPeriod, loadConsumptions]);

  // 페이지 포커스 시 데이터 다시 로드
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && user) {
        loadConsumptions();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, user, loadConsumptions]);

  const handleDeleteConsumption = async (consumptionId: string) => {
    if (!user) return;
    
    try {
      // 삭제할 소비 기록 찾기
      const consumptionToDelete = consumptions.find(c => c.id === consumptionId);
      if (!consumptionToDelete) {
        throw new Error('삭제할 소비 기록을 찾을 수 없습니다.');
      }

      console.log('소비 기록 삭제 중:', consumptionToDelete);
      
      // 소비 기록 삭제
      await consumptionService.deleteConsumption(consumptionId);
      
      // 커피 재고 원상복구
      await coffeeService.restoreBeans(consumptionToDelete.coffeeId, consumptionToDelete.amount);
      console.log('커피 재고 원상복구 완료:', consumptionToDelete.coffeeId, consumptionToDelete.amount, 'g');
      
      // 스토어에서 커피 재고 업데이트
      const updatedCoffee = coffees.find(c => c.id === consumptionToDelete.coffeeId);
      if (updatedCoffee) {
        updateCoffee(consumptionToDelete.coffeeId, {
          currentWeight: updatedCoffee.currentWeight + consumptionToDelete.amount
        });
      }
      
      // 스토어에서 소비 기록 제거
      setConsumptions(consumptions.filter(consumption => consumption.id !== consumptionId));
      
      alert('소비 기록이 삭제되고 커피 재고가 원상복구되었습니다!');
    } catch (error) {
      console.error('소비 기록 삭제 오류:', error);
      alert('소비 기록 삭제 중 오류가 발생했습니다.');
    }
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      'today': '오늘',
      'week': '이번 주',
      'month': '이번 달',
    };
    return labels[period] || period;
  };

  const getTotalConsumption = () => {
    return consumptions.length;
  };

  const getTotalBeanUsed = () => {
    return consumptions.reduce((total, consumption) => total + consumption.amount, 0);
  };

  const getConsumptionsForDate = (date: Date) => {
    return consumptions.filter(consumption => {
      const consumptionDate = consumption.consumedAt;
      return consumptionDate.toDateString() === date.toDateString();
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDateAdd = (date: Date) => {
    // 선택된 날짜를 URL 파라미터로 전달하여 빠른 소비 기록 페이지로 이동
    const dateString = date.toISOString().split('T')[0];
    router.push(`/consumption/quick?date=${dateString}`);
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">소비 기록</h1>
            <p className="mt-2 text-gray-600">
              커피 소비 현황을 확인하고 관리하세요
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 뷰 모드 토글 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                달력
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ListBulletIcon className="h-4 w-4" />
                목록
              </button>
            </div>
            
            <button
              onClick={() => router.push('/consumption/quick')}
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              빠른 기록
            </button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-amber-500">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 소비량</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalConsumption()}잔</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">사용된 원두</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalBeanUsed()}g</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 소비량</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {consumptions.length > 0 ? (getTotalBeanUsed() / consumptions.length).toFixed(1) : 0}g
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 달력 뷰 */}
        {viewMode === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 달력 */}
            <div className="lg:col-span-2">
              <ConsumptionCalendar
                consumptions={consumptions}
                onDateSelect={handleDateSelect}
                onDateAdd={handleDateAdd}
                selectedDate={selectedDate || undefined}
              />
              {/* 디버깅 정보 */}
              <div className="mt-4 text-xs text-gray-500 text-center">
                달력에 표시된 소비 기록: {consumptions.length}개
              </div>
            </div>
            
            {/* 선택된 날짜의 소비 기록 */}
            <div>
              {selectedDate ? (
                <SelectedDateConsumption
                  date={selectedDate}
                  consumptions={getConsumptionsForDate(selectedDate)}
                  onAddConsumption={handleDateAdd}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      날짜를 선택하세요
                    </h3>
                    <p className="text-gray-500">
                      달력에서 날짜를 클릭하면 해당 날짜의 소비 기록을 확인할 수 있습니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 목록 뷰 */
          <div>
            {/* 기간 필터 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">기간:</span>
                <div className="flex gap-2">
                  {(['today', 'week', 'month'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedPeriod === period
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {getPeriodLabel(period)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 소비 기록 목록 */}
            {consumptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ChartBarIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  소비 기록이 없습니다
                </h3>
                <p className="text-gray-500 mb-6">
                  첫 번째 커피 소비를 기록해보세요
                </p>
                <button
                  onClick={() => router.push('/consumption/quick')}
                  className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  소비 기록하기
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {consumptions.map((consumption) => (
                  <ConsumptionCard
                    key={consumption.id}
                    consumption={consumption}
                    onDelete={handleDeleteConsumption}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
