// 사용자 타입
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  nickname?: string;
  photoURL?: string;
  createdAt: Date;
}

// 커피 타입
export interface Coffee {
  id: string;
  name: string;
  brand?: string;
  type: 'single-origin' | 'blend' | 'espresso' | 'filter';
  weight: number; // g
  purchaseDate: Date;
  expiryDate?: Date;
  currentWeight: number; // 현재 남은 무게
  description?: string; // 커피 설명 (선택사항)
  cupNotes?: string; // 컵노트 (선택사항)
  roastingPoint?: string; // 로스팅 포인트 (선택사항)
  country?: string; // 국가 (선택사항)
  region?: string; // 지역 (선택사항)
  farm?: string; // 농장 (선택사항)
  variety?: string; // 품종 (선택사항)
  altitude?: string; // 고도 (선택사항)
  processingMethod?: string; // 가공방식 (선택사항)
  acidity?: number; // 산미 (1-5, 선택사항)
  body?: number; // 바디감 (1-5, 선택사항)
  fermentation?: number; // 발효도 (1-5, 선택사항)
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 커피 소비 기록 타입
export interface CoffeeConsumption {
  id: string;
  userId: string;
  userName: string; // 소비한 사용자 이름
  coffeeId: string;
  coffeeName: string;
  recipeId?: string;
  recipeName?: string;
  consumedAt: Date;
  amount: number; // 소비량 (g)
  notes?: string;
}

// 레시피 타입
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: 'espresso' | 'drip' | 'latte' | 'cappuccino' | 'americano' | 'cold-brew' | 'other';
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  totalBeanAmount: number; // 총 원두 사용량 (g)
  servings: number; // 몇 인분
  prepTime: number; // 준비 시간 (분)
  difficulty: 'easy' | 'medium' | 'hard';
  isFavorite: boolean;
  imageUrl?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 레시피 재료 타입
export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: 'g' | 'ml' | 'tsp' | 'tbsp' | 'cup';
}

// 레시피 단계 타입
export interface RecipeStep {
  stepNumber: number;
  description: string;
  duration?: number; // 단계별 소요 시간 (초)
  temperature?: number; // 온도 (°C)
}

// 원두 사용 기록 타입
export interface BeanUsage {
  id: string;
  userId: string;
  coffeeId: string;
  coffeeName: string;
  recipeId: string;
  recipeName: string;
  amount: number; // 사용량 (g)
  usedAt: Date;
  notes?: string;
}

// 통계 타입
export interface ConsumptionStats {
  daily: number;
  weekly: number;
  monthly: number;
  totalCups: number;
  totalBeanUsed: number;
}

// 대시보드 데이터 타입
export interface DashboardData {
  todayConsumption: number;
  totalCoffees: number;
  totalWeight: number;
  recentRecipes: Recipe[];
  weeklyStats: {
    date: string;
    consumption: number;
  }[];
}

// 알림 타입
export interface Notification {
  id: string;
  userId: string;
  type: 'low-stock' | 'coffee-time' | 'expiry-warning';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  data?: Record<string, unknown>;
}

// 게시판 타입
export interface BoardPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: 'general' | 'coffee-tip' | 'recipe-share' | 'question' | 'announcement';
  views: number;
  likes: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 게시판 댓글 타입
export interface BoardComment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}