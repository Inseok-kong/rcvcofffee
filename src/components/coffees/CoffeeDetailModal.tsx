'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Coffee } from '@/types';

interface CoffeeDetailModalProps {
  coffee: Coffee | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CoffeeDetailModal({ coffee, isOpen, onClose }: CoffeeDetailModalProps) {
  if (!coffee) return null;

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      'single-origin': '싱글오리진',
      'blend': '블렌드',
      'espresso': '에스프레소',
      'filter': '필터',
    };
    return names[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'single-origin': 'bg-green-100 text-green-800',
      'blend': 'bg-blue-100 text-blue-800',
      'espresso': 'bg-red-100 text-red-800',
      'filter': 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };


  const formatPrice = (price?: number) => {
    if (!price) return '미설정';
    return `${price.toLocaleString()}원`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                    {coffee.name}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* 기본 정보 */}
                <div className="space-y-6">
                  {/* 커피 타입과 브랜드 */}
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(coffee.type)}`}>
                      {getTypeName(coffee.type)}
                    </span>
                    {coffee.brand && (
                      <span className="text-gray-600 font-medium">{coffee.brand}</span>
                    )}
                  </div>

                  {/* 무게와 가격 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">무게 정보</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">총 무게</span>
                          <span className="font-medium">{coffee.weight}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">남은 무게</span>
                          <span className="font-medium">{coffee.currentWeight}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">사용량</span>
                          <span className="font-medium">{coffee.weight - coffee.currentWeight}g</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">구매 정보</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">구매일</span>
                          <span className="font-medium">{formatDate(coffee.purchaseDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">구매 가격</span>
                          <span className="font-medium">{formatPrice(coffee.price)}</span>
                        </div>
                        {coffee.expiryDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">유통기한</span>
                            <span className="font-medium">{formatDate(coffee.expiryDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 상세 정보 */}
                  {coffee.details && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">상세 정보</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-gray-900 font-mono text-sm leading-relaxed">
                          {coffee.details}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* 하단 버튼 */}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
