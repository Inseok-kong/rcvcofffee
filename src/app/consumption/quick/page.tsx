'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { consumptionService, coffeeService, recipeService } from '@/services/firebaseService';
import { Coffee, Recipe } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { HomeButton } from '@/components/ui/HomeButton';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CoffeeIcon } from '@/components/ui/CustomIcon';

function QuickConsumptionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, addConsumption } = useCoffeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState('');

  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedCoffee, setSelectedCoffee] = useState<string>('');
  const [selectedRecipe, setSelectedRecipe] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const loadData = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingData(true);
    try {
      const [coffeesData, recipesData] = await Promise.all([
        coffeeService.getCoffees(),
        recipeService.getRecipes(),
      ]);
      
      setCoffees(coffeesData);
      setRecipes(recipesData);
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
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
      loadData();
    }
  }, [isAuthenticated, user, loadData]);

  useEffect(() => {
    // URL에서 날짜 파라미터 가져오기
    const dateParam = searchParams.get('date');
    if (dateParam) {
      setSelectedDate(dateParam);
    } else {
      // 기본값은 오늘 날짜 (로컬 시간대 기준)
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayString = `${year}-${month}-${day}`;
      setSelectedDate(todayString);
    }

    // 기본값은 현재 시간
    const now = new Date();
    setSelectedTime(now.toTimeString().slice(0, 5)); // HH:MM 형식

    // URL에서 커피 ID 파라미터 가져오기
    const coffeeIdParam = searchParams.get('coffeeId');
    if (coffeeIdParam) {
      setSelectedCoffee(coffeeIdParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCoffee) return;

    setIsSubmitting(true);
    setError('');

    try {
      const selectedCoffeeData = coffees.find(c => c.id === selectedCoffee);
      const selectedRecipeData = selectedRecipe ? recipes.find(r => r.id === selectedRecipe) : null;

      if (!selectedCoffeeData) {
        throw new Error('선택된 커피를 찾을 수 없습니다.');
      }

      // 날짜와 시간을 결합하여 Date 객체 생성
      const consumedDateTime = new Date(`${selectedDate}T${selectedTime}`);
      
      console.log('소비기록 추가 - 날짜 정보:', {
        selectedDate,
        selectedTime,
        consumedDateTime: consumedDateTime.toISOString(),
        consumedDateString: consumedDateTime.toDateString()
      });
      
      const consumptionData = {
        userId: user.uid,
        userName: user.nickname || user.displayName || '사용자',
        coffeeId: selectedCoffee,
        coffeeName: selectedCoffeeData.name,
        recipeId: selectedRecipe || undefined,
        recipeName: selectedRecipeData?.name || undefined,
        consumedAt: consumedDateTime,
        amount: parseFloat(amount) || selectedRecipeData?.totalBeanAmount || 0,
        notes: notes || undefined,
      };

      console.log('소비 기록 추가 중:', consumptionData);
      const consumptionId = await consumptionService.addConsumption(consumptionData);
      console.log('소비 기록 ID:', consumptionId);
      
      // 스토어에 추가
      const newConsumption = {
        ...consumptionData,
        id: consumptionId,
      };
      console.log('스토어에 추가할 소비 기록:', newConsumption);
      addConsumption(newConsumption);

      // 원두 사용량 차감
      if (selectedRecipeData) {
        await coffeeService.consumeBeans(selectedCoffee, selectedRecipeData.totalBeanAmount);
      } else if (amount) {
        await coffeeService.consumeBeans(selectedCoffee, parseFloat(amount));
      }

      // 성공 메시지 표시
      alert('소비 기록이 성공적으로 추가되었습니다!');
      
      // 소비기록 페이지로 이동 (페이지 새로고침 없이)
      router.push('/consumption');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '소비 기록에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecipeChange = (recipeId: string) => {
    setSelectedRecipe(recipeId);
    if (recipeId) {
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe) {
        setAmount(recipe.totalBeanAmount.toString());
      }
    } else {
      setAmount('');
    }
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
            <h1 className="text-3xl font-bold text-gray-900">빠른 소비 기록</h1>
            <p className="mt-2 text-gray-600">
              {selectedDate ? `${selectedDate}에 마신 커피를 기록하세요` : '커피를 마셨을 때 빠르게 기록하세요'}
            </p>
            </div>
          </div>
          <HomeButton size="md" />
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 날짜와 시간 선택 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  소비 날짜 *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  소비 시간 *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  required
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
            {/* 커피 선택 */}
            <div>
              <label htmlFor="coffee" className="block text-sm font-medium text-gray-700 mb-2">
                커피 선택 *
              </label>
              <select
                id="coffee"
                name="coffee"
                required
                value={selectedCoffee}
                onChange={(e) => setSelectedCoffee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">커피를 선택하세요</option>
                {coffees.map((coffee) => (
                  <option key={coffee.id} value={coffee.id}>
                    {coffee.name} ({coffee.currentWeight}g 남음)
                  </option>
                ))}
              </select>
            </div>

            {/* 레시피 선택 */}
            <div>
              <label htmlFor="recipe" className="block text-sm font-medium text-gray-700 mb-2">
                레시피 선택 (선택사항)
              </label>
              <select
                id="recipe"
                name="recipe"
                value={selectedRecipe}
                onChange={(e) => handleRecipeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">레시피를 선택하세요</option>
                {recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name} ({recipe.totalBeanAmount}g)
                  </option>
                ))}
              </select>
            </div>

            {/* 사용량 */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                사용량 (g) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                required
                min="0"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="사용한 원두 무게를 입력하세요"
              />
            </div>

            {/* 메모 */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                메모 (선택사항)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="특별한 점이나 메모를 남겨보세요"
              />
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
                    기록 중...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CoffeeIcon className="h-4 w-4" />
                    소비 기록하기
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function QuickConsumptionPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <QuickConsumptionPageContent />
    </Suspense>
  );
}
