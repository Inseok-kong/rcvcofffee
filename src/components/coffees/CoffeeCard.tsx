'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Coffee } from '@/types';
import { 
  TrashIcon, 
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface CoffeeCardProps {
  coffee: Coffee;
  onDelete: (coffeeId: string) => void;
}

export function CoffeeCard({ coffee, onDelete }: CoffeeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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
    return (coffee.currentWeight / coffee.weight) * 100;
  };

  const isLowStock = () => {
    return getWeightPercentage() < 20;
  };

  const isExpiringSoon = () => {
    if (!coffee.expiryDate) return false;
    const today = new Date();
    const expiryDate = new Date(coffee.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 커피를 삭제하시겠습니까?')) {
      setIsDeleting(true);
      try {
        await onDelete(coffee.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const weightPercentage = getWeightPercentage();
  const isLow = isLowStock();
  const isExpiring = isExpiringSoon();

  return (
    <Link
      href={`/coffees/detail?id=${coffee.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {coffee.name}
          </h3>
          {coffee.brand && (
            <p className="text-sm text-gray-600 mb-2">{coffee.brand}</p>
          )}
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(coffee.type)}`}>
            {getTypeName(coffee.type)}
          </span>
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
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{weightPercentage.toFixed(1)}% 남음</span>
          {coffee.expiryDate && (
            <span>
              {isExpiring ? '곧 만료' : '유통기한 있음'}
            </span>
          )}
        </div>
      </div>

      {/* 날짜 정보 */}
      <div className="text-sm text-gray-500 mb-4">
        <div className="flex justify-between">
          <span>구매일: {new Date(coffee.purchaseDate).toLocaleDateString()}</span>
          {coffee.expiryDate && (
            <span>만료일: {new Date(coffee.expiryDate).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between">
        <span className="text-amber-600 text-sm font-medium">
          자세히 보기
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            title="커피 삭제"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
