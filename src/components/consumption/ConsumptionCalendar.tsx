'use client';

import { useState, useEffect } from 'react';
import { CoffeeConsumption } from '@/types';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { CoffeeIcon as CustomCoffeeIcon } from '@/components/ui/CustomIcon';

interface ConsumptionCalendarProps {
  consumptions: CoffeeConsumption[];
  onDateSelect?: (date: Date) => void;
  onDateAdd?: (date: Date) => void;
  selectedDate?: Date;
}

export function ConsumptionCalendar({ 
  consumptions, 
  onDateSelect, 
  onDateAdd,
  selectedDate 
}: ConsumptionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [consumptionsByDate, setConsumptionsByDate] = useState<Map<string, CoffeeConsumption[]>>(new Map());

  useEffect(() => {
    // 소비 기록을 날짜별로 그룹화
    const grouped = new Map<string, CoffeeConsumption[]>();
    
    consumptions.forEach(consumption => {
      const dateKey = consumption.consumedAt.toISOString().split('T')[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(consumption);
    });
    
    console.log('달력 소비 기록 업데이트:', consumptions.length, '개, 그룹화된 날짜:', grouped.size, '개');
    setConsumptionsByDate(grouped);
  }, [consumptions]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 이전 달의 빈 날짜들
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getConsumptionsForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return consumptionsByDate.get(dateKey) || [];
  };

  const getTotalConsumptionForDate = (date: Date) => {
    const dayConsumptions = getConsumptionsForDate(date);
    return dayConsumptions.reduce((total, consumption) => total + consumption.amount, 0);
  };

  const getConsumptionCountForDate = (date: Date) => {
    return getConsumptionsForDate(date).length;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const handleDateDoubleClick = (date: Date) => {
    if (onDateAdd) {
      onDateAdd(date);
    }
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const days = getDaysInMonth(currentDate);
  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 달력 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {year}년 {monthName}
          </h2>
          
          <button
            onClick={goToNextMonth}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        
        <button
          onClick={goToToday}
          className="flex items-center gap-2 px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm"
        >
          <CalendarIcon className="h-4 w-4" />
          오늘
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-16"></div>;
          }

          const totalAmount = getTotalConsumptionForDate(date);
          const consumptionCount = getConsumptionCountForDate(date);
          const hasConsumption = consumptionCount > 0;

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              onDoubleClick={() => handleDateDoubleClick(date)}
              className={`
                h-16 p-1 text-left border border-gray-100 rounded-lg transition-all duration-200
                ${isToday(date) ? 'bg-amber-50 border-amber-200' : ''}
                ${isSelected(date) ? 'bg-amber-100 border-amber-300' : ''}
                ${hasConsumption ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'hover:bg-gray-50'}
                ${!hasConsumption && !isToday(date) && !isSelected(date) ? 'text-gray-400' : 'text-gray-900'}
                group relative
              `}
              title={hasConsumption ? '클릭: 상세보기, 더블클릭: 추가' : '더블클릭: 소비 기록 추가'}
            >
              <div className="flex flex-col h-full">
                <div className="text-sm font-medium mb-1">
                  {date.getDate()}
                </div>
                
                {hasConsumption && (
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-center gap-1">
                      <CustomCoffeeIcon className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        {consumptionCount}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 text-center">
                      {totalAmount}g
                    </div>
                  </div>
                )}
                
                {/* 더블클릭 힌트 */}
                {!hasConsumption && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="text-xs text-gray-400 text-center">
                        더블클릭<br/>추가
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
          <span className="text-gray-600">소비 기록 있음</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-50 border border-amber-200 rounded"></div>
          <span className="text-gray-600">오늘</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"></div>
          <span className="text-gray-600">선택됨</span>
        </div>
      </div>
      
      {/* 사용법 안내 */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>💡 <strong>사용법:</strong> 날짜를 클릭하면 상세보기, 더블클릭하면 소비 기록 추가</p>
      </div>
    </div>
  );
}
