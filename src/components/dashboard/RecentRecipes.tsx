'use client';

import Link from 'next/link';
import { Recipe } from '@/types';
import { BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface RecentRecipesProps {
  recipes: Recipe[];
}

export function RecentRecipes({ recipes }: RecentRecipesProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'espresso': 'bg-red-100 text-red-800',
      'drip': 'bg-blue-100 text-blue-800',
      'latte': 'bg-pink-100 text-pink-800',
      'cappuccino': 'bg-amber-100 text-amber-800',
      'americano': 'bg-gray-100 text-gray-800',
      'cold-brew': 'bg-cyan-100 text-cyan-800',
      'other': 'bg-purple-100 text-purple-800',
    };
    return colors[category] || colors['other'];
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'espresso': '에스프레소',
      'drip': '드립',
      'latte': '라떼',
      'cappuccino': '카푸치노',
      'americano': '아메리카노',
      'cold-brew': '콜드브루',
      'other': '기타',
    };
    return names[category] || '기타';
  };

  if (recipes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">최근 레시피</h3>
          <Link
            href="/recipes"
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            모두 보기
          </Link>
        </div>
        <div className="text-center py-8">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">아직 등록된 레시피가 없습니다</p>
          <Link
            href="/recipes/new"
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <BookOpenIcon className="h-4 w-4 mr-2" />
            첫 레시피 추가하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">최근 레시피</h3>
        <Link
          href="/recipes"
          className="text-amber-600 hover:text-amber-700 text-sm font-medium"
        >
          모두 보기
        </Link>
      </div>
      
      <div className="space-y-4">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/detail?id=${recipe.id}`}
            className="block p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                  {recipe.isFavorite && (
                    <StarSolidIcon className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(recipe.category)}`}>
                    {getCategoryName(recipe.category)}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{recipe.prepTime}분</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span>{recipe.totalBeanAmount}g</span>
                  </div>
                </div>
                
                {recipe.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {recipe.description}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
