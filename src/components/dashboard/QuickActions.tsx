'use client';

import Link from 'next/link';
import { PlusIcon, BookOpenIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { CoffeeIcon } from '@/components/ui/CustomIcon';

export function QuickActions() {
  const handleActionClick = (href: string, name: string) => {
    console.log(`${name} 클릭됨: ${href}`);
  };

  const actions = [
    {
      name: '커피 추가',
      href: '/coffees/new',
      icon: PlusIcon,
      color: 'bg-amber-500 hover:bg-amber-600',
    },
    {
      name: '커피 마시기',
      href: '/consumption/quick',
      icon: CoffeeIcon,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: '레시피 추가',
      href: '/recipes/new',
      icon: BookOpenIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: '통계 보기',
      href: '/consumption',
      icon: ChartBarIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {actions.map((action) => (
        <Link
          key={action.name}
          href={action.href}
          onClick={() => handleActionClick(action.href, action.name)}
          className={`${action.color} text-white rounded-lg p-4 text-center transition-colors`}
        >
          <action.icon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm font-medium">{action.name}</p>
        </Link>
      ))}
    </div>
  );
}
