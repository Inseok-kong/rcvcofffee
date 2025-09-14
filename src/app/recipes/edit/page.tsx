'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { recipeService } from '@/services/firebaseService';
import { Recipe } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { HomeButton } from '@/components/ui/HomeButton';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

function EditRecipePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipeId = searchParams.get('id');
  
  const { user, isAuthenticated, isLoading } = useCoffeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState('');
  
  // 인증 체크
  const { isReady } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    totalBeanAmount: '',
    description: '',
    imageUrl: '',
    category: 'espresso' as Recipe['category'],
    servings: 1,
    prepTime: 0,
    difficulty: 'easy' as Recipe['difficulty'],
    isFavorite: false,
    process: '',
    grindSize: '',
  });

  // const loadCoffees = useCallback(async () => {
  //   if (!user) return;
  //   
  //   setIsLoadingData(true);
  //   try {
  //     const coffeesData = await coffeeService.getCoffees();
  //     setCoffees(coffeesData);
  //   } catch (error) {
  //     console.error('커피 데이터 로딩 오류:', error);
  //   } finally {
  //     setIsLoadingData(false);
  //   }
  // }, [user]);

  const loadRecipe = useCallback(async () => {
    if (!user || !recipeId) return;
    
    setIsLoadingData(true);
    try {
      const recipe = await recipeService.getRecipe(recipeId);
      if (recipe) {
        setFormData({
          name: recipe.name,
          totalBeanAmount: recipe.totalBeanAmount.toString(),
          description: recipe.description || '',
          imageUrl: recipe.imageUrl || '',
          category: recipe.category,
          servings: recipe.servings,
          prepTime: recipe.prepTime,
          difficulty: recipe.difficulty,
          isFavorite: recipe.isFavorite,
          process: recipe.process || '',
          grindSize: recipe.grindSize || '',
        });
      }
    } catch (error) {
      console.error('레시피 데이터 로딩 오류:', error);
      setError('레시피를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingData(false);
    }
  }, [user, recipeId]);

  // 인증 체크는 useAuth 훅에서 처리됨

  useEffect(() => {
    if (isAuthenticated && user) {
      loadRecipe();
    }
  }, [isAuthenticated, user, loadRecipe]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !recipeId) return;

    setIsSubmitting(true);
    setError('');

    try {
      // 유효성 검사
      if (!formData.name.trim()) {
        throw new Error('레시피 이름을 입력해주세요.');
      }

      // 원두 선택 검증 제거 (ingredients 배열로 관리)

      if (!formData.totalBeanAmount || parseFloat(formData.totalBeanAmount) <= 0) {
        throw new Error('원두 사용량을 입력해주세요.');
      }

      if (!formData.process.trim()) {
        throw new Error('제조 과정을 입력해주세요.');
      }

      const recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.trim(),
        totalBeanAmount: parseFloat(formData.totalBeanAmount),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        category: formData.category,
        servings: formData.servings,
        prepTime: formData.prepTime,
        difficulty: formData.difficulty,
        isFavorite: formData.isFavorite,
        ingredients: [], // 기본 빈 배열 (필요시 나중에 추가)
        process: formData.process.trim(),
        grindSize: formData.grindSize.trim() || undefined,
        userId: user.uid,
      };

      console.log('레시피 수정 중:', recipeData);
      await recipeService.updateRecipe(recipeId, recipeData);
      console.log('레시피 수정 완료');

      // 성공 메시지 표시
      alert('레시피가 성공적으로 수정되었습니다!');
      
      // 레시피 목록 페이지로 이동
      router.push('/recipes');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '레시피 수정에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">레시피 수정</h1>
            <p className="mt-2 text-gray-600">
              기존 레시피를 수정하세요
            </p>
          </div>
          <div className="ml-auto">
            <HomeButton />
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  레시피 이름 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="예: 에스프레소"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                >
                  <option value="espresso">에스프레소</option>
                  <option value="americano">아메리카노</option>
                  <option value="latte">라떼</option>
                  <option value="cappuccino">카푸치노</option>
                  <option value="mocha">모카</option>
                  <option value="macchiato">마키아토</option>
                  <option value="cold-brew">콜드브루</option>
                  <option value="pour-over">푸어오버</option>
                  <option value="french-press">프렌치프레스</option>
                  <option value="aeropress">에어로프레스</option>
                  <option value="v60">V60</option>
                  <option value="chemex">케멕스</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="레시피에 대한 간단한 설명을 입력하세요"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                이미지 URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* 원두 정보 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">원두 정보</h2>
            
            <div>
              <label htmlFor="totalBeanAmount" className="block text-sm font-medium text-gray-700 mb-2">
                원두 사용량 (g) *
              </label>
              <input
                type="number"
                id="totalBeanAmount"
                name="totalBeanAmount"
                value={formData.totalBeanAmount}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="예: 18"
                required
              />
            </div>

            <div>
              <label htmlFor="grindSize" className="block text-sm font-medium text-gray-700 mb-2">
                분쇄 입자 크기
              </label>
              <input
                type="text"
                id="grindSize"
                name="grindSize"
                value={formData.grindSize}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="예: 중간 정도, 에스프레소용, 드립용, 콜드브루용"
              />
            </div>
          </div>

          {/* 레시피 세부 정보 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">레시피 세부 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
                  인분
                </label>
                <input
                  type="number"
                  id="servings"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700 mb-2">
                  준비 시간 (분)
                </label>
                <input
                  type="number"
                  id="prepTime"
                  name="prepTime"
                  value={formData.prepTime}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                  난이도
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="easy">쉬움</option>
                  <option value="medium">보통</option>
                  <option value="hard">어려움</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isFavorite"
                  checked={formData.isFavorite}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">즐겨찾기</span>
              </label>
            </div>
          </div>

          {/* 제조 과정 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">제조 과정</h2>
            <textarea
              name="process"
              value={formData.process}
              onChange={handleInputChange}
              placeholder="커피 제조 과정을 자유롭게 작성해주세요&#10;예:&#10;1. 원두 20g을 그라인더로 중간 정도로 분쇄&#10;2. 드립퍼에 필터를 넣고 원두를 넣어줍니다&#10;3. 92도 물로 40ml 블룸을 30초간 진행&#10;4. 이후 2분 30초에 걸쳐 300ml까지 추출"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              rows={8}
              required
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '수정 중...' : '레시피 수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditRecipePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <EditRecipePageContent />
    </Suspense>
  );
}
