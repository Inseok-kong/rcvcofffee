'use client';

import { CoffeeConsumption } from '@/types';
import { 
  ClockIcon, 
  ChartBarIcon,
  CalendarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { CoffeeIcon as CustomCoffeeIcon } from '@/components/ui/CustomIcon';

interface SelectedDateConsumptionProps {
  date: Date;
  consumptions: CoffeeConsumption[];
  onAddConsumption?: (date: Date) => void;
}

export function SelectedDateConsumption({ date, consumptions, onAddConsumption }: SelectedDateConsumptionProps) {
  const totalAmount = consumptions.reduce((total, consumption) => total + consumption.amount, 0);
  const totalCount = consumptions.length;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (consumptions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {formatDate(date)}
          </h3>
          <p className="text-gray-500 mb-4">
            이 날에는 커피를 마시지 않았습니다.
          </p>
          {onAddConsumption && (
            <button
              onClick={() => onAddConsumption(date)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              소비 기록 추가
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {formatDate(date)}
          </h3>
          <p className="text-sm text-gray-600">
            총 {totalCount}번의 커피 소비
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-600">
              {totalAmount}g
            </div>
            <div className="text-sm text-gray-600">총 소비량</div>
          </div>
          
          {onAddConsumption && (
            <button
              onClick={() => onAddConsumption(date)}
              className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              title="소비 기록 추가"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <CustomCoffeeIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{totalCount}</div>
              <div className="text-sm text-amber-700">커피 횟수</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{totalAmount}g</div>
              <div className="text-sm text-green-700">총 소비량</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {totalCount > 0 ? Math.round(totalAmount / totalCount) : 0}g
              </div>
              <div className="text-sm text-blue-700">평균 소비량</div>
            </div>
          </div>
        </div>
      </div>

      {/* 소비 기록 목록 */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">소비 기록</h4>
        <div className="space-y-3">
          {consumptions
            .sort((a, b) => b.consumedAt.getTime() - a.consumedAt.getTime())
            .map((consumption, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <CustomCoffeeIcon className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {consumption.coffeeName}
                  </div>
                  <div className="text-sm text-gray-600">
                    마신 사람: {consumption.userName}
                  </div>
                  {consumption.recipeName && (
                    <div className="text-sm text-gray-600">
                      레시피: {consumption.recipeName}
                    </div>
                  )}
                  {consumption.notes && (
                    <div className="text-sm text-gray-500 mt-1">
                      &quot;{consumption.notes}&quot;
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold text-amber-600">
                  {consumption.amount}g
                </div>
                <div className="text-sm text-gray-500">
                  {formatTime(consumption.consumedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
