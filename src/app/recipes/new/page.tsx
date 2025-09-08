'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { recipeService, coffeeService } from '@/services/firebaseService';
import { Recipe, RecipeStep, Coffee } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { HomeButton } from '@/components/ui/HomeButton';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function NewRecipePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, addRecipe } = useCoffeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    selectedCoffeeId: '',
    totalBeanAmount: '',
  });

  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [steps, setSteps] = useState<RecipeStep[]>([
    { stepNumber: 1, description: '', duration: undefined, temperature: undefined }
  ]);

  const loadCoffees = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingData(true);
    try {
      const coffeesData = await coffeeService.getCoffees();
      setCoffees(coffeesData);
    } catch (error) {
      console.error('커피 데이터 로딩 오류:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCoffees();
    }
  }, [isAuthenticated, user, loadCoffees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      // 유효성 검사
      if (!formData.name.trim()) {
        throw new Error('레시피 이름을 입력해주세요.');
      }

      if (!formData.selectedCoffeeId) {
        throw new Error('원두를 선택해주세요.');
      }

      if (!formData.totalBeanAmount || parseFloat(formData.totalBeanAmount) <= 0) {
        throw new Error('원두 사용량을 입력해주세요.');
      }

      const validSteps = steps.filter(step => step.description.trim());
      
      if (validSteps.length === 0) {
        throw new Error('최소 하나의 제조 과정을 입력해주세요.');
      }

      const selectedCoffee = coffees.find(coffee => coffee.id === formData.selectedCoffeeId);
      if (!selectedCoffee) {
        throw new Error('선택한 원두를 찾을 수 없습니다.');
      }

      const recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        description: `${selectedCoffee.name}을 사용한 레시피`,
        category: 'other',
        ingredients: [{
          name: selectedCoffee.name,
          amount: parseFloat(formData.totalBeanAmount),
          unit: 'g'
        }],
        steps: validSteps.map((step, index) => ({
          ...step,
          stepNumber: index + 1,
          duration: step.duration ? parseInt(step.duration.toString()) : undefined,
          temperature: step.temperature ? parseInt(step.temperature.toString()) : undefined,
        })),
        totalBeanAmount: parseFloat(formData.totalBeanAmount),
        servings: 1,
        prepTime: 0,
        difficulty: 'easy',
        isFavorite: false,
        userId: user.uid,
      };

      const recipeId = await recipeService.addRecipe(recipeData);
      
      // 스토어에 추가
      addRecipe({
        ...recipeData,
        id: recipeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      router.push('/recipes');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '레시피 추가에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const addStep = () => {
    setSteps([...steps, { 
      stepNumber: steps.length + 1, 
      description: '', 
      duration: undefined, 
      temperature: undefined 
    }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, field: keyof RecipeStep, value: string | number) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold text-gray-900">새 레시피 추가</h1>
              <p className="mt-2 text-gray-600">
                커피 레시피를 등록하고 관리하세요
              </p>
            </div>
          </div>
          <HomeButton size="md" />
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  레시피 이름 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  placeholder="예: 에티오피아 예가체프 드립"
                />
              </div>

              <div>
                <label htmlFor="selectedCoffeeId" className="block text-sm font-medium text-gray-700 mb-2">
                  원두 종류 *
                </label>
                <select
                  id="selectedCoffeeId"
                  name="selectedCoffeeId"
                  required
                  value={formData.selectedCoffeeId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">원두를 선택하세요</option>
                  {coffees.map((coffee) => (
                    <option key={coffee.id} value={coffee.id}>
                      {coffee.name} ({coffee.type}) - {coffee.currentWeight}g 남음
                    </option>
                  ))}
                </select>
                {coffees.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    저장된 원두가 없습니다. 먼저 원두를 추가해주세요.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="totalBeanAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  원두 사용량 (g) *
                </label>
                <input
                  type="number"
                  id="totalBeanAmount"
                  name="totalBeanAmount"
                  required
                  min="0"
                  step="0.1"
                  value={formData.totalBeanAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  placeholder="예: 20"
                />
              </div>
            </div>


            {/* 단계 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">제조 과정 *</h3>
                <button
                  type="button"
                  onClick={addStep}
                  className="inline-flex items-center px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  단계 추가
                </button>
              </div>
              
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">단계 {index + 1}</span>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <textarea
                      placeholder="단계별 설명을 입력하세요"
                      value={step.description}
                      onChange={(e) => updateStep(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 mb-2"
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="소요 시간 (초)"
                        min="0"
                        value={step.duration || ''}
                        onChange={(e) => updateStep(index, 'duration', parseInt(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      />
                      <input
                        type="number"
                        placeholder="온도 (°C)"
                        min="0"
                        value={step.temperature || ''}
                        onChange={(e) => updateStep(index, 'temperature', parseInt(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* 제출 버튼 */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    추가 중...
                  </div>
                ) : (
                  '레시피 추가'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
