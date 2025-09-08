'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { coffeeService } from '@/services/firebaseService';
import { Coffee } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { HomeButton } from '@/components/ui/HomeButton';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NewCoffeePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, addCoffee } = useCoffeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    type: 'single-origin' as Coffee['type'],
    weight: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    description: '',
    cupNotes: '',
    roastingPoint: '',
    country: '',
    region: '',
    farm: '',
    variety: '',
    altitude: '',
    processingMethod: '',
    acidity: '',
    body: '',
    fermentation: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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
        currentWeight: parseFloat(formData.weight),
        purchaseDate: new Date(formData.purchaseDate),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        description: formData.description || undefined,
        cupNotes: formData.cupNotes || undefined,
        roastingPoint: formData.roastingPoint || undefined,
        country: formData.country || undefined,
        region: formData.region || undefined,
        farm: formData.farm || undefined,
        variety: formData.variety || undefined,
        altitude: formData.altitude || undefined,
        processingMethod: formData.processingMethod || undefined,
        acidity: formData.acidity ? parseInt(formData.acidity) : undefined,
        body: formData.body ? parseInt(formData.body) : undefined,
        fermentation: formData.fermentation ? parseInt(formData.fermentation) : undefined,
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

  if (isLoading) {
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

            {/* 구분선 */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">상세 정보 (선택사항)</h3>
            </div>

            {/* 설명 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="커피에 대한 간단한 설명을 입력하세요"
              />
            </div>

            {/* 컵노트 */}
            <div>
              <label htmlFor="cupNotes" className="block text-sm font-medium text-gray-700 mb-2">
                컵노트
              </label>
              <input
                type="text"
                id="cupNotes"
                name="cupNotes"
                value={formData.cupNotes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="예: 복숭아, 요구르트, 자두, 청포도"
              />
            </div>

            {/* 로스팅 포인트 */}
            <div>
              <label htmlFor="roastingPoint" className="block text-sm font-medium text-gray-700 mb-2">
                로스팅 포인트
              </label>
              <input
                type="text"
                id="roastingPoint"
                name="roastingPoint"
                value={formData.roastingPoint}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="예: Light #86"
              />
            </div>

            {/* 국가 */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                국가
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="예: Panama"
              />
            </div>

            {/* 지역 */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                지역
              </label>
              <input
                type="text"
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="예: Paso Ancho, Chiriqui"
              />
            </div>

            {/* 농장 */}
            <div>
              <label htmlFor="farm" className="block text-sm font-medium text-gray-700 mb-2">
                농장
              </label>
              <input
                type="text"
                id="farm"
                name="farm"
                value={formData.farm}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="예: Santa Maria Estate Coffee"
              />
            </div>

            {/* 품종 */}
            <div>
              <label htmlFor="variety" className="block text-sm font-medium text-gray-700 mb-2">
                품종
              </label>
              <input
                type="text"
                id="variety"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="예: Geisha"
              />
            </div>

            {/* 고도 */}
            <div>
              <label htmlFor="altitude" className="block text-sm font-medium text-gray-700 mb-2">
                고도
              </label>
              <input
                type="text"
                id="altitude"
                name="altitude"
                value={formData.altitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="예: 1,564m - 1,946m"
              />
            </div>

            {/* 가공방식 */}
            <div>
              <label htmlFor="processingMethod" className="block text-sm font-medium text-gray-700 mb-2">
                가공방식
              </label>
              <input
                type="text"
                id="processingMethod"
                name="processingMethod"
                value={formData.processingMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="예: Natural, Washed, Honey"
              />
            </div>

            {/* 감각적 특성 */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">감각적 특성 (1-5점)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 산미 */}
                <div>
                  <label htmlFor="acidity" className="block text-sm font-medium text-gray-700 mb-2">
                    산미
                  </label>
                  <select
                    id="acidity"
                    name="acidity"
                    value={formData.acidity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="1">1점 (낮음)</option>
                    <option value="2">2점</option>
                    <option value="3">3점 (보통)</option>
                    <option value="4">4점</option>
                    <option value="5">5점 (높음)</option>
                  </select>
                </div>

                {/* 바디감 */}
                <div>
                  <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                    바디감
                  </label>
                  <select
                    id="body"
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="1">1점 (가벼움)</option>
                    <option value="2">2점</option>
                    <option value="3">3점 (보통)</option>
                    <option value="4">4점</option>
                    <option value="5">5점 (무거움)</option>
                  </select>
                </div>

                {/* 발효도 */}
                <div>
                  <label htmlFor="fermentation" className="block text-sm font-medium text-gray-700 mb-2">
                    발효도
                  </label>
                  <select
                    id="fermentation"
                    name="fermentation"
                    value={formData.fermentation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="1">1점 (낮음)</option>
                    <option value="2">2점</option>
                    <option value="3">3점 (보통)</option>
                    <option value="4">4점</option>
                    <option value="5">5점 (높음)</option>
                  </select>
                </div>
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
