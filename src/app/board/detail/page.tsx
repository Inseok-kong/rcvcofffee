'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCoffeeStore } from '@/store/useStore';
import { boardService } from '@/services/firebaseService';
import { BoardPost, BoardComment } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { HomeButton } from '@/components/ui/HomeButton';
import { 
  ArrowLeftIcon, 
  EyeIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

function BoardDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useCoffeeStore();
  const [post, setPost] = useState<BoardPost | null>(null);
  const [comments, setComments] = useState<BoardComment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  const postId = searchParams.get('id');

  const loadPost = useCallback(async () => {
    if (!postId || !user) return;
    
    setIsLoadingData(true);
    try {
      const postData = await boardService.getPost(postId);
      if (postData) {
        setPost(postData);
        // 조회수 증가
        await boardService.incrementViews(postId);
        setPost(prev => prev ? { ...prev, views: prev.views + 1 } : null);
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

  const loadComments = useCallback(async () => {
    if (!postId) return;
    
    try {
      const commentsData = await boardService.getComments(postId);
      setComments(commentsData);
    } catch (error) {
      console.error('댓글 로딩 오류:', error);
    }
  }, [postId]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user && postId) {
      loadPost();
      loadComments();
    }
  }, [isAuthenticated, user, postId, loadPost, loadComments]);

  const handleDeletePost = async () => {
    if (!post || !user || post.authorId !== user.uid) return;
    
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      await boardService.deletePost(post.id);
      router.push('/board');
    } catch (error) {
      console.error('게시글 삭제 오류:', error);
      setError('게시글 삭제에 실패했습니다.');
    }
  };

  const handleLike = async () => {
    if (!post || !user) return;
    
    try {
      await boardService.toggleLike(post.id);
      setPost(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    } catch (error) {
      console.error('좋아요 오류:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !user || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await boardService.createComment({
        postId: post.id,
        content: newComment.trim(),
        authorId: user.uid,
        authorName: user.displayName || '익명',
      });

      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      setError('댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      await boardService.deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
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
              <h1 className="text-3xl font-bold text-gray-900">게시글</h1>
              <p className="mt-2 text-gray-600">
                커피 관련 정보를 공유하고 소통해보세요
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

        {/* 게시글 내용 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                {getCategoryName(post.category)}
              </span>
              {post.isPinned && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  공지
                </span>
              )}
            </div>
            
            {post.authorId === user?.uid && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/board/edit?id=${post.id}`)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="수정"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDeletePost}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="삭제"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {post.title}
          </h2>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
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

          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-800">
              {post.content}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <HeartSolidIcon className="h-5 w-5" />
              <span>좋아요 {post.likes}</span>
            </button>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            댓글 {comments.length}개
          </h3>

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 작성하세요"
                rows={3}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 resize-none"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingComment ? '작성 중...' : '작성'}
              </button>
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">
              {newComment.length}/500
            </div>
          </form>

          {/* 댓글 목록 */}
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">{comment.authorName}</span>
                        <span className="text-sm text-gray-500">
                          {comment.createdAt.toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    
                    {comment.authorId === user?.uid && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="삭제"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BoardDetailPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <BoardDetailContent />
    </Suspense>
  );
}
