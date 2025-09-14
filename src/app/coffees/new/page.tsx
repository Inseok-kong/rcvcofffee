'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { coffeeService } from '@/services/firebaseService';
import { Coffee } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { HomeButton } from '@/components/ui/HomeButton';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export default function NewCoffeePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, addCoffee } = useCoffeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // 인증 체크
  const { isReady } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    type: 'single-origin' as Coffee['type'],
    weight: '',
    price: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    details: '',
  });

  // 인증 체크는 useAuth 훅에서 처리됨

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      const coffeeData: Omit<Coffee, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        brand: formData.brand || undefined,
        type: formData.type,
        weight: parseFloat(formData.weight),
        price: formData.price ? parseFloat(formData.price) : undefined,
        currentWeight: parseFloat(formData.weight),
        purchaseDate: new Date(formData.purchaseDate),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        details: formData.details || '',
        userId: user.uid,
      };

      const coffeeId = await coffeeService.addCoffee(coffeeData);
      
      // 스토어에 추가
      addCoffee({
        ...coffeeData,
        id: coffeeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      router.push('/coffees');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '커피 추가에 실패했습니다.';
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

  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 디버깅을 위한 정보 표시
  console.log('Rendering coffee new page:', { isLoading, isAuthenticated, user: !!user });

  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">인증이 필요합니다.</p>
          <p className="text-sm text-gray-600 mb-4">
            isLoading: {isLoading.toString()}, 
            isAuthenticated: {isAuthenticated.toString()}, 
            user: {user ? 'exists' : 'null'}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    );
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
              <h1 className="text-3xl font-bold text-gray-900">새 커피 추가</h1>
              <p className="mt-2 text-gray-600">
                보유하고 있는 커피 원두 정보를 입력하세요
              </p>
            </div>
          </div>
          <HomeButton size="md" />
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 커피 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                커피 이름 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="예: 에티오피아 예가체프"
              />
            </div>

            {/* 브랜드 */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                브랜드
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="예: 블루보틀"
              />
            </div>

            {/* 커피 타입 */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                커피 타입 *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="single-origin">싱글오리진</option>
                <option value="blend">블렌드</option>
                <option value="espresso">에스프레소</option>
                <option value="filter">필터</option>
              </select>
            </div>

            {/* 무게 */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                원두 무게 (g) *
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                required
                min="0"
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="예: 250"
              />
            </div>

            {/* 구매 가격 */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                구매 가격 (원)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="100"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="예: 25000"
              />
            </div>

            {/* 구매일 */}
            <div>
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                구매일 *
              </label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                required
                value={formData.purchaseDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* 유통기한 */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                유통기한
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* 상세 정보 */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">상세 정보</h3>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                placeholder="커피에 대한 상세 정보를 자유롭게 작성해주세요&#10;예:&#10;• 국가: Panama&#10;• 지역: Paso Ancho, Chiriqui&#10;• 농장: Santa Maria Estate Coffee&#10;• 품종: Geisha&#10;• 고도: 1,564m - 1,946m&#10;• 가공방식: Natural&#10;• 로스팅 포인트: Light #86&#10;• 컵노트: 복숭아, 요구르트, 자두, 청포도&#10;• 산미: 4점 (높음)&#10;• 바디감: 3점 (보통)&#10;• 발효도: 2점 (낮음)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                rows={12}
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
                    추가 중...
                  </div>
                ) : (
                  '커피 추가'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
