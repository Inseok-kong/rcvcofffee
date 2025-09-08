'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Recipe } from '@/types';
import { 
  PencilIcon, 
  TrashIcon, 
  StarIcon,
  ClockIcon,
  ScaleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (recipeId: string) => void;
  onToggleFavorite: (recipeId: string, isFavorite: boolean) => void;
}

export function RecipeCard({ recipe, onToggleFavorite, onDelete }: RecipeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'easy': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'hard': 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyName = (difficulty: string) => {
    const names: Record<string, string> = {
      'easy': '쉬움',
      'medium': '보통',
      'hard': '어려움',
    };
    return names[difficulty] || difficulty;
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 레시피를 삭제하시겠습니까?')) {
      setIsDeleting(true);
      try {
        await onDelete(recipe.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleToggleFavorite = () => {
    onToggleFavorite(recipe.id, recipe.isFavorite);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{recipe.name}</h3>
            <button
              onClick={handleToggleFavorite}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {recipe.isFavorite ? (
                <StarSolidIcon className="h-5 w-5 text-amber-500" />
              ) : (
                <StarIcon className="h-5 w-5 text-gray-400 hover:text-amber-500" />
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(recipe.category)}`}>
              {getCategoryName(recipe.category)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
              {getDifficultyName(recipe.difficulty)}
            </span>
          </div>
        </div>
      </div>

      {/* 설명 */}
      {recipe.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {recipe.description}
        </p>
      )}

      {/* 정보 */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            <span>{recipe.prepTime}분</span>
          </div>
          
          <div className="flex items-center gap-1">
            <ScaleIcon className="h-4 w-4" />
            <span>{recipe.totalBeanAmount}g</span>
          </div>
          
          <div className="flex items-center gap-1">
            <BookOpenIcon className="h-4 w-4" />
            <span>{recipe.servings}인분</span>
          </div>
        </div>
      </div>

      {/* 재료 미리보기 */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">주요 재료:</p>
        <div className="flex flex-wrap gap-1">
          {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {ingredient.name} {ingredient.amount}{ingredient.unit}
            </span>
          ))}
          {recipe.ingredients.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              +{recipe.ingredients.length - 3}개 더
            </span>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between">
        <Link
          href={`/recipes/detail?id=${recipe.id}`}
          className="text-amber-600 hover:text-amber-700 text-sm font-medium"
        >
          자세히 보기
        </Link>
        
        <div className="flex items-center gap-2">
          <Link
            href={`/recipes/edit?id=${recipe.id}`}
            className="p-2 text-gray-400 hover:text-amber-600 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
          </Link>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
