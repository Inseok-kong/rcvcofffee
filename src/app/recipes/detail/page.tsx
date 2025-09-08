'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { recipeService } from '@/services/firebaseService';
import { Recipe } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { HomeButton } from '@/components/ui/HomeButton';
import { 
  ArrowLeftIcon, 
  ClockIcon, 
  PencilIcon,
  TrashIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

function RecipeDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, updateRecipe, removeRecipe } = useCoffeeStore();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(true);
  const [error, setError] = useState('');

  const recipeId = searchParams.get('id');

  const loadRecipe = useCallback(async () => {
    if (!user || !recipeId) return;

    setIsLoadingRecipe(true);
    setError('');

    try {
      const recipeData = await recipeService.getRecipe(recipeId);
      
      if (!recipeData) {
        setError('레시피를 찾을 수 없습니다.');
        return;
      }

      if (recipeData.userId !== user.uid) {
        setError('이 레시피에 접근할 권한이 없습니다.');
        return;
      }

      setRecipe(recipeData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '레시피를 불러오는데 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoadingRecipe(false);
    }
  }, [user, recipeId]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user && recipeId) {
      loadRecipe();
    }
  }, [isAuthenticated, user, recipeId, loadRecipe]);

  const handleToggleFavorite = async () => {
    if (!recipe || !user) return;

    try {
      const updatedRecipe = { ...recipe, isFavorite: !recipe.isFavorite };
      await recipeService.updateRecipe(recipeId!, { isFavorite: !recipe.isFavorite });
      
      setRecipe(updatedRecipe);
      updateRecipe(recipeId!, { isFavorite: !recipe.isFavorite });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '즐겨찾기 상태 변경에 실패했습니다.';
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!recipe || !user) return;

    if (!confirm('정말로 이 레시피를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await recipeService.deleteRecipe(recipeId!);
      removeRecipe(recipeId!);
      router.push('/recipes');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '레시피 삭제에 실패했습니다.';
      setError(errorMessage);
    }
  };

  const getDifficultyText = (difficulty: Recipe['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return '알 수 없음';
    }
  };

  const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryText = (category: Recipe['category']) => {
    switch (category) {
      case 'espresso': return '에스프레소';
      case 'drip': return '드립';
      case 'latte': return '라떼';
      case 'cappuccino': return '카푸치노';
      case 'americano': return '아메리카노';
      case 'cold-brew': return '콜드브루';
      case 'other': return '기타';
      default: return '알 수 없음';
    }
  };

  if (isLoading || isLoadingRecipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <HomeButton size="md" />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
            <button
              onClick={() => router.push('/recipes')}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              레시피 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{recipe.name}</h1>
              <p className="mt-2 text-gray-600">
                {recipe.description || '설명이 없습니다.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HomeButton size="md" />
            <button
              onClick={() => router.push(`/recipes/edit?id=${recipeId}`)}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="레시피 수정"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="레시피 삭제"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">기본 정보</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{recipe.totalBeanAmount}g</div>
                  <div className="text-sm text-gray-600">원두 사용량</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{recipe.servings}인분</div>
                  <div className="text-sm text-gray-600">인분</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{recipe.prepTime}분</div>
                  <div className="text-sm text-gray-600">준비 시간</div>
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                    {getDifficultyText(recipe.difficulty)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">난이도</div>
                </div>
              </div>
            </div>

            {/* 재료 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">재료</h2>
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium text-gray-900">{ingredient.name}</span>
                    <span className="text-gray-600">
                      {ingredient.amount} {ingredient.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 제조 과정 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">제조 과정</h2>
              <div className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{step.description}</p>
                      <div className="flex gap-4 text-sm text-gray-600">
                        {step.duration && (
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {step.duration}초
                          </div>
                        )}
                        {step.temperature && (
                          <div className="flex items-center gap-1">
                            <span>🌡️</span>
                            {step.temperature}°C
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 카테고리 및 즐겨찾기 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">레시피 정보</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">카테고리</div>
                  <div className="text-lg font-medium text-gray-900">
                    {getCategoryText(recipe.category)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">즐겨찾기</div>
                  <button
                    onClick={handleToggleFavorite}
                    className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    {recipe.isFavorite ? (
                      <HeartIconSolid className="h-5 w-5" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span className="text-sm">
                      {recipe.isFavorite ? '즐겨찾기됨' : '즐겨찾기 추가'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 레시피 실행 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">레시피 실행</h3>
              <button
                onClick={() => router.push(`/consumption/quick?recipe=${recipeId}`)}
                className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                이 레시피로 커피 만들기
              </button>
            </div>

            {/* 생성 정보 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">생성 정보</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">생성일:</span> {recipe.createdAt.toLocaleDateString('ko-KR')}
                </div>
                <div>
                  <span className="font-medium">수정일:</span> {recipe.updatedAt.toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecipeDetailPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <RecipeDetailPageContent />
    </Suspense>
  );
}
