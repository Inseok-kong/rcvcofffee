'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { boardService } from '@/services/firebaseService';
import { BoardPost } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  PlusIcon, 
  EyeIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function BoardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useCoffeeStore();
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'general', label: '일반' },
    { value: 'coffee-tip', label: '커피 팁' },
    { value: 'recipe-share', label: '레시피 공유' },
    { value: 'question', label: '질문' },
    { value: 'announcement', label: '공지사항' },
  ];

  const loadPosts = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingData(true);
    try {
      const postsData = await boardService.getPosts(selectedCategory === 'all' ? undefined : selectedCategory);
      setPosts(postsData);
    } catch (error) {
      console.error('게시글 데이터 로딩 오류:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, selectedCategory]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadPosts();
    }
  }, [isAuthenticated, user, loadPosts]);

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      await boardService.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('게시글 삭제 오류:', error);
    }
  };


  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'general': 'bg-gray-100 text-gray-800',
      'coffee-tip': 'bg-amber-100 text-amber-800',
      'recipe-share': 'bg-blue-100 text-blue-800',
      'question': 'bg-green-100 text-green-800',
      'announcement': 'bg-red-100 text-red-800',
    };
    return colors[category] || colors['general'];
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'general': '일반',
      'coffee-tip': '커피 팁',
      'recipe-share': '레시피 공유',
      'question': '질문',
      'announcement': '공지사항',
    };
    return names[category] || '일반';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">게시판</h1>
            <p className="mt-2 text-gray-600">
              커피 관련 정보를 공유하고 소통해보세요
            </p>
          </div>
          <button
            onClick={() => router.push('/board/new')}
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            글쓰기
          </button>
        </div>

        {/* 카테고리 필터 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">카테고리:</span>
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
          </div>
        </div>

        {/* 게시글 목록 */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              아직 게시글이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              첫 번째 게시글을 작성해보세요
            </p>
            <button
              onClick={() => router.push('/board/new')}
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              글쓰기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/board/detail?id=${post.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                        {getCategoryName(post.category)}
                      </span>
                      {post.isPinned && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          공지
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {post.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{post.authorName}</span>
                      <span>{post.createdAt.toLocaleDateString('ko-KR')}</span>
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HeartIcon className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </div>
                    </div>
                  </div>
                  
                  {post.authorId === user?.uid && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/board/edit?id=${post.id}`);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="수정"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="삭제"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
