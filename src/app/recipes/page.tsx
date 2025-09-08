'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { recipeService } from '@/services/firebaseService';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function RecipesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, recipes, setRecipes } = useCoffeeStore();
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'espresso', label: '에스프레소' },
    { value: 'drip', label: '드립' },
    { value: 'latte', label: '라떼' },
    { value: 'cappuccino', label: '카푸치노' },
    { value: 'americano', label: '아메리카노' },
    { value: 'cold-brew', label: '콜드브루' },
    { value: 'other', label: '기타' },
  ];

  const loadRecipes = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingData(true);
    try {
      const recipesData = await recipeService.getRecipes();
      setRecipes(recipesData);
    } catch (error) {
      console.error('레시피 데이터 로딩 오류:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, setRecipes]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadRecipes();
    }
  }, [isAuthenticated, user, loadRecipes]);

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!user) return;
    
    try {
      await recipeService.deleteRecipe(recipeId);
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    } catch (error) {
      console.error('레시피 삭제 오류:', error);
    }
  };

  const handleToggleFavorite = async (recipeId: string, isFavorite: boolean) => {
    if (!user) return;
    
    try {
      await recipeService.updateRecipe(recipeId, { isFavorite: !isFavorite });
      setRecipes(recipes.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, isFavorite: !isFavorite }
          : recipe
      ));
    } catch (error) {
      console.error('즐겨찾기 토글 오류:', error);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesFavorite = !showFavoritesOnly || recipe.isFavorite;
    return matchesCategory && matchesFavorite;
  });

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">레시피</h1>
            <p className="mt-2 text-gray-600">
              커피 레시피를 관리하고 즐겨찾기하세요
            </p>
          </div>
          <button
            onClick={() => router.push('/recipes/new')}
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            레시피 추가
          </button>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">필터:</span>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">즐겨찾기만 보기</span>
            </label>
          </div>
        </div>

        {/* 레시피 목록 */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PlusIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedCategory !== 'all' || showFavoritesOnly 
                ? '해당 조건에 맞는 레시피가 없습니다'
                : '아직 등록된 레시피가 없습니다'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {selectedCategory !== 'all' || showFavoritesOnly 
                ? '다른 조건으로 검색해보세요'
                : '첫 번째 레시피를 추가해보세요'
              }
            </p>
            <button
              onClick={() => router.push('/recipes/new')}
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              레시피 추가하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={handleDeleteRecipe}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
