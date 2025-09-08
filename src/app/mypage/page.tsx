'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { authService } from '@/services/authService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { HomeButton } from '@/components/ui/HomeButton';
import { 
  UserIcon, 
  PencilIcon, 
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function MyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser } = useCoffeeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || user.displayName || '');
    }
  }, [user]);

  const handleSaveNickname = async () => {
    if (!user) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!nickname.trim()) {
        throw new Error('닉네임을 입력해주세요.');
      }

      // Firestore에 사용자 정보 업데이트
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      await setDoc(doc(db, 'users', user.uid), {
        ...user,
        nickname: nickname.trim(),
        updatedAt: new Date(),
      }, { merge: true });

      // 스토어 업데이트
      setUser({
        ...user,
        nickname: nickname.trim(),
      });

      setSuccess('닉네임이 성공적으로 저장되었습니다.');
      setIsEditing(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '닉네임 저장에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNickname(user?.nickname || user?.displayName || '');
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
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
              <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
              <p className="mt-2 text-gray-600">
                프로필을 관리하고 설정을 변경하세요
              </p>
            </div>
          </div>
          <HomeButton size="md" />
        </div>

        {/* 프로필 카드 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-6">
            {/* 프로필 이미지 */}
            <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="프로필"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-10 w-10 text-amber-600" />
              )}
            </div>

            {/* 사용자 정보 */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {user.nickname || user.displayName || '사용자'}
              </h2>
              <p className="text-gray-600 mb-1">{user.email}</p>
              <p className="text-sm text-gray-500">
                가입일: {user.createdAt instanceof Date ? user.createdAt.toLocaleDateString('ko-KR') : new Date(user.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </div>

        {/* 닉네임 설정 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">닉네임 설정</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                <span>수정</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                  닉네임
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  maxLength={20}
                />
                <p className="text-sm text-gray-500 mt-1">
                  소비 기록에 표시될 이름입니다. (최대 20자)
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveNickname}
                  disabled={isSaving || !nickname.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckIcon className="h-4 w-4" />
                  {isSaving ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <span className="font-medium">현재 닉네임:</span>{' '}
                {user.nickname || user.displayName || '설정되지 않음'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                소비 기록에 이 이름이 표시됩니다.
              </p>
            </div>
          )}

          {/* 메시지 */}
          {error && (
            <div className="mt-4 text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 text-green-600 text-sm bg-green-50 p-3 rounded-md">
              {success}
            </div>
          )}
        </div>

        {/* 계정 관리 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 관리</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">이메일</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">가입일</p>
                <p className="text-sm text-gray-600">
                  {user.createdAt instanceof Date ? user.createdAt.toLocaleDateString('ko-KR') : new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
