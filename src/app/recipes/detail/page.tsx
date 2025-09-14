'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { recipeService, recipeCommentService } from '@/services/firebaseService';
import { Recipe, RecipeComment } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { HomeButton } from '@/components/ui/HomeButton';
import { 
  ArrowLeftIcon, 
  ClockIcon, 
  PencilIcon,
  TrashIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

function RecipeDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, updateRecipe, removeRecipe } = useCoffeeStore();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  const recipeId = searchParams.get('id');

  const loadRecipe = useCallback(async () => {
    if (!user || !recipeId) return;

    setIsLoadingRecipe(true);
    setError('');

    try {
      const recipeData = await recipeService.getRecipe(recipeId);
      
      if (!recipeData) {
        setError('레시피를 찾을 수 없습니다.');
        return;
      }

      setRecipe(recipeData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '레시피를 불러오는데 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoadingRecipe(false);
    }
  }, [user, recipeId]);

  const loadComments = useCallback(async () => {
    if (!recipeId) return;

    setIsLoadingComments(true);
    try {
      const commentsData = await recipeCommentService.getComments(recipeId);
      setComments(commentsData);
    } catch (error: unknown) {
      console.error('댓글 로딩 오류:', error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [recipeId]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user && recipeId) {
      loadRecipe();
      loadComments();
    }
  }, [isAuthenticated, user, recipeId, loadRecipe, loadComments]);

  const handleToggleFavorite = async () => {
    if (!recipe || !user) return;

    try {
      const updatedRecipe = { ...recipe, isFavorite: !recipe.isFavorite };
      await recipeService.updateRecipe(recipeId!, { isFavorite: !recipe.isFavorite });
      
      setRecipe(updatedRecipe);
      updateRecipe(recipeId!, { isFavorite: !recipe.isFavorite });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '즐겨찾기 상태 변경에 실패했습니다.';
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!recipe || !user) return;

    if (!confirm('정말로 이 레시피를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await recipeService.deleteRecipe(recipeId!);
      removeRecipe(recipeId!);
      router.push('/recipes');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '레시피 삭제에 실패했습니다.';
      setError(errorMessage);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !recipeId || !newComment.trim()) return;

    try {
      const commentData = {
        recipeId,
        content: newComment.trim(),
        rating: newRating,
        authorId: user.uid,
        authorName: user.displayName || '익명',
      };

      await recipeCommentService.createComment(commentData);
      setNewComment('');
      setNewRating(5);
      loadComments();
    } catch (error: unknown) {
      console.error('댓글 추가 오류:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;

    try {
      await recipeCommentService.deleteComment(commentId);
      loadComments();
    } catch (error: unknown) {
      console.error('댓글 삭제 오류:', error);
    }
  };

  const getDifficultyText = (difficulty: Recipe['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return '알 수 없음';
    }
  };

  const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryText = (category: Recipe['category']) => {
    switch (category) {
      case 'espresso': return '에스프레소';
      case 'drip': return '드립';
      case 'latte': return '라떼';
      case 'cappuccino': return '카푸치노';
      case 'americano': return '아메리카노';
      case 'cold-brew': return '콜드브루';
      case 'other': return '기타';
      default: return '알 수 없음';
    }
  };

  if (isLoading || isLoadingRecipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <HomeButton size="md" />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
            <button
              onClick={() => router.push('/recipes')}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              레시피 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
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
              <h1 className="text-3xl font-bold text-gray-900">{recipe.name}</h1>
              <p className="mt-2 text-gray-600">
                {recipe.description || '설명이 없습니다.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HomeButton size="md" />
            <button
              onClick={() => router.push(`/recipes/edit?id=${recipeId}`)}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="레시피 수정"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="레시피 삭제"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">기본 정보</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{recipe.totalBeanAmount}g</div>
                  <div className="text-sm text-gray-600">원두 사용량</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{recipe.servings}인분</div>
                  <div className="text-sm text-gray-600">인분</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{recipe.prepTime}분</div>
                  <div className="text-sm text-gray-600">준비 시간</div>
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                    {getDifficultyText(recipe.difficulty)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">난이도</div>
                </div>
              </div>
            </div>

            {/* 재료 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">재료</h2>
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium text-gray-900">{ingredient.name}</span>
                    <span className="text-gray-600">
                      {ingredient.amount} {ingredient.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 제조 과정 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">제조 과정</h2>
              {recipe.grindSize && (
                <div className="mb-4 p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-amber-800">분쇄 입자 크기:</span>
                    <span className="text-amber-900">{recipe.grindSize}</span>
                  </div>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-gray-900 font-mono text-sm leading-relaxed">
                  {recipe.process || '제조 과정이 없습니다.'}
                </pre>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 카테고리 및 즐겨찾기 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">레시피 정보</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">카테고리</div>
                  <div className="text-lg font-medium text-gray-900">
                    {getCategoryText(recipe.category)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">즐겨찾기</div>
                  <button
                    onClick={handleToggleFavorite}
                    className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    {recipe.isFavorite ? (
                      <HeartIconSolid className="h-5 w-5" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span className="text-sm">
                      {recipe.isFavorite ? '즐겨찾기됨' : '즐겨찾기 추가'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 레시피 실행 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">레시피 실행</h3>
              <button
                onClick={() => router.push(`/consumption/quick?recipe=${recipeId}`)}
                className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                이 레시피로 커피 만들기
              </button>
            </div>

            {/* 생성 정보 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">생성 정보</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">생성일:</span> {recipe.createdAt.toLocaleDateString('ko-KR')}
                </div>
                <div>
                  <span className="font-medium">수정일:</span> {recipe.updatedAt.toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">맛 평가 댓글</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                  💬 {comments.length}개 댓글
                </span>
              </div>
            </div>
            
            {/* 댓글 작성 폼 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-8 border border-amber-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">✍️</span>
                <h3 className="text-lg font-semibold text-gray-900">맛 평가 남기기</h3>
              </div>
              <form onSubmit={handleAddComment}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      평점 (1-5점) *
                    </label>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value={1}>1점 - 별로</option>
                      <option value={2}>2점 - 아쉬움</option>
                      <option value={3}>3점 - 보통</option>
                      <option value={4}>4점 - 좋음</option>
                      <option value={5}>5점 - 최고</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      맛 평가 *
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="이 레시피에 대한 맛 평가를 자유롭게 남겨주세요...&#10;예: 정말 맛있었어요! 향이 좋고 바디감도 적당했습니다."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <span>💬</span>
                    맛 평가 남기기
                  </button>
                </div>
              </form>
            </div>

            {/* 댓글 목록 */}
            {isLoadingComments ? (
              <div className="text-center py-8">
                <LoadingSpinner size="sm" />
                <p className="text-gray-500 mt-2">댓글을 불러오는 중...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">💭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">아직 댓글이 없습니다</h3>
                <p className="text-gray-500">첫 번째 맛 평가를 남겨보세요!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-gray-700">총 {comments.length}개의 맛 평가</span>
                </div>
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-amber-600 font-medium text-sm">
                            {comment.authorName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{comment.authorName}</span>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${
                                  i < comment.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="text-xs text-gray-500 ml-1">
                              ({comment.rating}/5)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {comment.createdAt.toLocaleDateString('ko-KR')}
                        </span>
                        {user && comment.authorId === user.uid && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecipeDetailPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <RecipeDetailPageContent />
    </Suspense>
  );
}
