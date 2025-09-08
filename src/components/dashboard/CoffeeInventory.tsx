'use client';

import Link from 'next/link';
import { Coffee } from '@/types';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CoffeeIcon } from '@/components/ui/CustomIcon';

interface CoffeeInventoryProps {
  coffees: Coffee[];
}

export function CoffeeInventory({ coffees }: CoffeeInventoryProps) {
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

  const getWeightPercentage = (coffee: Coffee) => {
    return (coffee.currentWeight / coffee.weight) * 100;
  };

  const isLowStock = (coffee: Coffee) => {
    return getWeightPercentage(coffee) < 20;
  };

  const isExpiringSoon = (coffee: Coffee) => {
    if (!coffee.expiryDate) return false;
    const today = new Date();
    const expiryDate = new Date(coffee.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  if (coffees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">커피 재고</h3>
          <Link
            href="/coffees"
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            모두 보기
          </Link>
        </div>
        <div className="text-center py-8">
          <CoffeeIcon className="h-12 w-12 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">아직 등록된 커피가 없습니다</p>
          <Link
            href="/coffees/new"
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <CoffeeIcon className="h-4 w-4 mr-2" />
            첫 커피 추가하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">커피 재고</h3>
        <Link
          href="/coffees"
          className="text-amber-600 hover:text-amber-700 text-sm font-medium"
        >
          모두 보기
        </Link>
      </div>
      
      <div className="space-y-4">
        {coffees.slice(0, 5).map((coffee) => {
          const weightPercentage = getWeightPercentage(coffee);
          const isLow = isLowStock(coffee);
          const isExpiring = isExpiringSoon(coffee);
          
          return (
            <Link
              key={coffee.id}
              href={`/coffees/${coffee.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{coffee.name}</h4>
                    {isLow && (
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                    )}
                    {isExpiring && (
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(coffee.type)}`}>
                      {getTypeName(coffee.type)}
                    </span>
                    {coffee.brand && (
                      <span className="text-gray-600">{coffee.brand}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
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
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{weightPercentage.toFixed(1)}% 남음</span>
                  {coffee.expiryDate && (
                    <span>
                      {isExpiring ? '곧 만료' : '유통기한 있음'}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
