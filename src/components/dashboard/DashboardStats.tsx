'use client';

import { ChartBarIcon, ScaleIcon } from '@heroicons/react/24/outline';
import { CoffeeIcon } from '@/components/ui/CustomIcon';

interface DashboardStatsProps {
  todayConsumption: number;
  totalCoffees: number;
  totalWeight: number;
}

export function DashboardStats({ todayConsumption, totalCoffees, totalWeight }: DashboardStatsProps) {
  const stats = [
    {
      name: '오늘 마신 커피',
      value: todayConsumption,
      unit: '잔',
      icon: CoffeeIcon,
      color: 'bg-amber-500',
    },
    {
      name: '보유 커피 종류',
      value: totalCoffees,
      unit: '종류',
      icon: ChartBarIcon,
      color: 'bg-blue-500',
    },
    {
      name: '총 원두 무게',
      value: totalWeight,
      unit: 'g',
      icon: ScaleIcon,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="ml-1 text-sm text-gray-500">{stat.unit}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
