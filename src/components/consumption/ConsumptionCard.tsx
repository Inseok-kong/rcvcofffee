'use client';

import { useState } from 'react';
import { CoffeeConsumption } from '@/types';
import { 
  TrashIcon,
  ClockIcon,
  ScaleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { CoffeeIcon } from '@/components/ui/CustomIcon';

interface ConsumptionCardProps {
  consumption: CoffeeConsumption;
  onDelete: (consumptionId: string) => void;
}

export function ConsumptionCard({ consumption, onDelete }: ConsumptionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('정말로 이 소비 기록을 삭제하시겠습니까?')) {
      setIsDeleting(true);
      try {
        await onDelete(consumption.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* 커피 정보 */}
          <div className="flex items-center gap-2 mb-2">
            <CoffeeIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-gray-900">
              {consumption.coffeeName}
            </h3>
          </div>

          {/* 사용자 정보 */}
          <div className="flex items-center gap-2 mb-2">
            <UserIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">마신 사람:</span>
            <span className="text-sm font-medium text-gray-900">
              {consumption.userName}
            </span>
          </div>

          {/* 레시피 정보 */}
          {consumption.recipeName && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">레시피:</span>
              <span className="text-sm font-medium text-gray-900">
                {consumption.recipeName}
              </span>
            </div>
          )}

          {/* 시간 정보 */}
          <div className="flex items-center gap-2 mb-3">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {formatTime(consumption.consumedAt)}
            </span>
          </div>

          {/* 사용량 정보 */}
          <div className="flex items-center gap-2 mb-2">
            <ScaleIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              사용량: <span className="font-medium">{consumption.amount}g</span>
            </span>
          </div>

          {/* 메모 */}
          {consumption.notes && (
            <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
              {consumption.notes}
            </p>
          )}
        </div>

        {/* 삭제 버튼 */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
