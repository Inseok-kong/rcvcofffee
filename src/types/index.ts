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
  price?: number; // 구매 가격 (원, 선택사항)
  purchaseDate: Date;
  expiryDate?: Date;
  currentWeight: number; // 현재 남은 무게
  details: string; // 상세정보를 메모장 형태로 저장
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
  process: string; // 제조과정을 메모장 형태로 저장
  grindSize?: string; // 분쇄 입자 크기
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

// 레시피 댓글 타입 (맛 평가)
export interface RecipeComment {
  id: string;
  recipeId: string;
  content: string;
  rating: number; // 1-5점 평가
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}