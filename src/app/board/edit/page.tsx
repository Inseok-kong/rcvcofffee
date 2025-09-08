'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { boardService } from '@/services/firebaseService';
import { BoardPost } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { HomeButton } from '@/components/ui/HomeButton';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function EditPostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useCoffeeStore();
  const [post, setPost] = useState<BoardPost | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('general');
  const [isPinned, setIsPinned] = useState(false);

  const postId = searchParams.get('id');

  const categories = [
    { value: 'general', label: '일반' },
    { value: 'coffee-tip', label: '커피 팁' },
    { value: 'recipe-share', label: '레시피 공유' },
    { value: 'question', label: '질문' },
    { value: 'announcement', label: '공지사항' },
  ];

  const loadPost = useCallback(async () => {
    if (!postId || !user) return;
    
    setIsLoadingData(true);
    try {
      const postData = await boardService.getPost(postId);
      if (postData) {
        if (postData.authorId !== user.uid) {
          setError('수정 권한이 없습니다.');
          return;
        }
        
        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content);
        setCategory(postData.category);
        setIsPinned(postData.isPinned);
      } else {
        setError('게시글을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('게시글 로딩 오류:', error);
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingData(false);
    }
  }, [postId, user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user && postId) {
      loadPost();
    }
  }, [isAuthenticated, user, postId, loadPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !user) return;

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await boardService.updatePost(post.id, {
        title: title.trim(),
        content: content.trim(),
        category: category as BoardPost['category'],
        isPinned: isPinned,
      });

      router.push(`/board/detail?id=${post.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '게시글 수정에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !post) {
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
              <h1 className="text-3xl font-bold text-gray-900">글 수정</h1>
              <p className="mt-2 text-gray-600">
                게시글을 수정해보세요
              </p>
            </div>
          </div>
          <HomeButton size="md" />
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-6 text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* 수정 폼 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 카테고리 선택 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                maxLength={100}
              />
            </div>

            {/* 내용 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 resize-none"
                maxLength={2000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {content.length}/2000
              </div>
            </div>

            {/* 공지사항 체크박스 */}
            <div className="flex items-center">
              <input
                id="isPinned"
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-700">
                공지사항으로 등록 (관리자만 가능)
              </label>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '수정 중...' : '수정하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditPostPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <EditPostContent />
    </Suspense>
  );
}
