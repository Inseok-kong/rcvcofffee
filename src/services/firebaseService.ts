import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Coffee, Recipe, CoffeeConsumption, BeanUsage, RecipeComment } from '@/types';

// 컬렉션 참조들
const coffeesRef = collection(db, 'coffees');
const recipesRef = collection(db, 'recipes');
const consumptionsRef = collection(db, 'consumptions');
const beanUsagesRef = collection(db, 'beanUsages');
const recipeCommentsRef = collection(db, 'recipeComments');

// 커피 관련 서비스
export const coffeeService = {
  // 모든 커피 조회 (공유 재고)
  async getCoffees(): Promise<Coffee[]> {
    const q = query(coffeesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      purchaseDate: doc.data().purchaseDate.toDate(),
      expiryDate: doc.data().expiryDate?.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Coffee[];
  },

  // 커피 추가
  async addCoffee(coffee: Omit<Coffee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(coffeesRef, {
      ...coffee,
      purchaseDate: Timestamp.fromDate(coffee.purchaseDate),
      expiryDate: coffee.expiryDate ? Timestamp.fromDate(coffee.expiryDate) : null,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    return docRef.id;
  },

  // 커피 수정
  async updateCoffee(id: string, updates: Partial<Coffee>): Promise<void> {
    const coffeeRef = doc(coffeesRef, id);
    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    };
    
    if (updates.purchaseDate) {
      updateData.purchaseDate = Timestamp.fromDate(updates.purchaseDate);
    }
    if (updates.expiryDate) {
      updateData.expiryDate = Timestamp.fromDate(updates.expiryDate);
    }
    
    await updateDoc(coffeeRef, updateData);
  },

  // 커피 삭제
  async deleteCoffee(id: string): Promise<void> {
    await deleteDoc(doc(coffeesRef, id));
  },

  // 원두 사용량 차감
  async consumeBeans(coffeeId: string, amount: number): Promise<void> {
    const coffeeRef = doc(coffeesRef, coffeeId);
    const coffeeDoc = await getDoc(coffeeRef);
    
    if (coffeeDoc.exists()) {
      const currentWeight = coffeeDoc.data().currentWeight;
      const newWeight = Math.max(0, currentWeight - amount);
      
      await updateDoc(coffeeRef, {
        currentWeight: newWeight,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    }
  },

  // 원두 사용량 복구 (소비 기록 삭제 시)
  async restoreBeans(coffeeId: string, amount: number): Promise<void> {
    const coffeeRef = doc(coffeesRef, coffeeId);
    const coffeeDoc = await getDoc(coffeeRef);
    
    if (coffeeDoc.exists()) {
      const currentWeight = coffeeDoc.data().currentWeight;
      const newWeight = currentWeight + amount;
      
      await updateDoc(coffeeRef, {
        currentWeight: newWeight,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    }
  },
};

// 레시피 관련 서비스
export const recipeService = {
  // 모든 레시피 조회 (공유 레시피)
  async getRecipes(limitCount?: number): Promise<Recipe[]> {
    let q = query(recipesRef, orderBy('createdAt', 'desc'));
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Recipe[];
  },

  // 즐겨찾기 레시피 조회
  async getFavoriteRecipes(userId: string): Promise<Recipe[]> {
    const q = query(
      recipesRef, 
      where('userId', '==', userId), 
      where('isFavorite', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Recipe[];
  },

  // 카테고리별 레시피 조회
  async getRecipesByCategory(userId: string, category: string): Promise<Recipe[]> {
    const q = query(
      recipesRef, 
      where('userId', '==', userId), 
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Recipe[];
  },


  // 단일 레시피 조회
  async getRecipe(recipeId: string): Promise<Recipe | null> {
    const recipeDoc = await getDoc(doc(recipesRef, recipeId));
    if (!recipeDoc.exists()) {
      return null;
    }
    
    return {
      id: recipeDoc.id,
      ...recipeDoc.data(),
      createdAt: recipeDoc.data().createdAt.toDate(),
      updatedAt: recipeDoc.data().updatedAt.toDate(),
    } as Recipe;
  },

  // 레시피 추가
  async addRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    
    // 기본 필수 필드들만 포함한 객체 생성
    const recipeData: Record<string, unknown> = {
      name: recipe.name,
      category: recipe.category,
      ingredients: recipe.ingredients || [],
      process: recipe.process || '',
      totalBeanAmount: recipe.totalBeanAmount,
      servings: recipe.servings,
      prepTime: recipe.prepTime,
      difficulty: recipe.difficulty,
      isFavorite: recipe.isFavorite,
      userId: recipe.userId,
    };
    
    // 선택적 필드들만 유효한 값이 있을 때 추가
    if (recipe.description && typeof recipe.description === 'string' && recipe.description.trim()) {
      recipeData.description = recipe.description;
    }
    
    if (recipe.imageUrl && typeof recipe.imageUrl === 'string' && recipe.imageUrl.trim()) {
      recipeData.imageUrl = recipe.imageUrl;
    }
    
    // 모든 undefined 값 제거
    const finalData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(recipeData)) {
      if (value !== undefined && value !== null) {
        finalData[key] = value;
      }
    }
    
    console.log('Adding recipe with cleaned data:', JSON.stringify(finalData, null, 2));
    
    try {
      const docRef = await addDoc(recipesRef, {
        ...finalData,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding recipe:', error);
      console.error('Recipe data that caused error:', JSON.stringify(finalData, null, 2));
      throw error;
    }
  },

  // 레시피 수정
  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<void> {
    const recipeRef = doc(recipesRef, id);
    
    // undefined 값들을 제거
    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.fromDate(new Date()),
    };
    
    Object.keys(updates).forEach(key => {
      const value = updates[key as keyof Recipe];
      if (value !== undefined) {
        updateData[key] = value;
      }
    });
    
    await updateDoc(recipeRef, updateData);
  },

  // 레시피 삭제
  async deleteRecipe(id: string): Promise<void> {
    await deleteDoc(doc(recipesRef, id));
  },

  // 이미지 업로드 (Storage 사용 안함)
  async uploadRecipeImage(): Promise<string> {
    // Storage를 사용하지 않으므로 빈 문자열 반환
    return '';
  },
};

// 소비 기록 관련 서비스
export const consumptionService = {
  // 소비 기록 조회 (공유 소비 기록)
  async getConsumptions(limitCount?: number): Promise<CoffeeConsumption[]> {
    let q = query(
      consumptionsRef, 
      orderBy('consumedAt', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      consumedAt: doc.data().consumedAt.toDate(),
    })) as CoffeeConsumption[];
  },


  // 오늘의 소비 기록 조회
  async getTodayConsumptions(userId: string): Promise<CoffeeConsumption[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const q = query(
      consumptionsRef,
      where('userId', '==', userId),
      where('consumedAt', '>=', Timestamp.fromDate(today)),
      where('consumedAt', '<', Timestamp.fromDate(tomorrow)),
      orderBy('consumedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      consumedAt: doc.data().consumedAt.toDate(),
    })) as CoffeeConsumption[];
  },

  // 소비 기록 추가
  async addConsumption(consumption: Omit<CoffeeConsumption, 'id'>): Promise<string> {
    // undefined 값들을 제거
    const consumptionData = { ...consumption };
    if (consumptionData.recipeId === undefined) {
      delete consumptionData.recipeId;
    }
    if (consumptionData.recipeName === undefined) {
      delete consumptionData.recipeName;
    }
    if (consumptionData.notes === undefined) {
      delete consumptionData.notes;
    }
    
    const docRef = await addDoc(consumptionsRef, {
      ...consumptionData,
      consumedAt: Timestamp.fromDate(consumption.consumedAt),
    });
    return docRef.id;
  },

  // 소비 기록 삭제
  async deleteConsumption(id: string): Promise<void> {
    await deleteDoc(doc(consumptionsRef, id));
  },
};

// 원두 사용량 관련 서비스
export const beanUsageService = {
  // 원두 사용 기록 조회
  async getBeanUsages(userId: string): Promise<BeanUsage[]> {
    const q = query(beanUsagesRef, where('userId', '==', userId), orderBy('usedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      usedAt: doc.data().usedAt.toDate(),
    })) as BeanUsage[];
  },

  // 원두 사용 기록 추가
  async addBeanUsage(beanUsage: Omit<BeanUsage, 'id'>): Promise<string> {
    const docRef = await addDoc(beanUsagesRef, {
      ...beanUsage,
      usedAt: Timestamp.fromDate(beanUsage.usedAt),
    });
    return docRef.id;
  },

  // 레시피 실행 시 원두 사용량 자동 차감
  async executeRecipe(recipe: Recipe, coffeeId: string, userId: string, userName: string): Promise<void> {
    // recipe.id가 없는 경우 처리
    if (!recipe.id) {
      throw new Error('레시피 ID가 없습니다.');
    }
    
    const batch = writeBatch(db);
    
    // 원두 사용량 차감
    const coffeeRef = doc(coffeesRef, coffeeId);
    const coffeeDoc = await getDoc(coffeeRef);
    
    if (coffeeDoc.exists()) {
      const currentWeight = coffeeDoc.data().currentWeight;
      const newWeight = Math.max(0, currentWeight - recipe.totalBeanAmount);
      
      batch.update(coffeeRef, {
        currentWeight: newWeight,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    }
    
    // 원두 사용 기록 추가
    const beanUsageRef = doc(beanUsagesRef);
    batch.set(beanUsageRef, {
      userId,
      coffeeId,
      coffeeName: coffeeDoc.data()?.name || '',
      recipeId: recipe.id,
      recipeName: recipe.name || '',
      amount: recipe.totalBeanAmount,
      usedAt: Timestamp.fromDate(new Date()),
    });
    
    // 소비 기록 추가
    const consumptionRef = doc(consumptionsRef);
    batch.set(consumptionRef, {
      userId,
      userName,
      coffeeId,
      coffeeName: coffeeDoc.data()?.name || '',
      recipeId: recipe.id,
      recipeName: recipe.name || '',
      consumedAt: Timestamp.fromDate(new Date()),
      amount: recipe.totalBeanAmount,
    });
    
    await batch.commit();
  },
};

// 레시피 댓글 관련 서비스
export const recipeCommentService = {
  // 레시피 댓글 조회
  async getComments(recipeId: string): Promise<RecipeComment[]> {
    const q = query(
      recipeCommentsRef,
      where('recipeId', '==', recipeId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as RecipeComment[];
  },

  // 댓글 작성
  async createComment(comment: Omit<RecipeComment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(recipeCommentsRef, {
      ...comment,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    return docRef.id;
  },

  // 댓글 수정
  async updateComment(commentId: string, updates: Partial<RecipeComment>): Promise<void> {
    const commentRef = doc(recipeCommentsRef, commentId);
    await updateDoc(commentRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  },

  // 댓글 삭제
  async deleteComment(commentId: string): Promise<void> {
    await deleteDoc(doc(recipeCommentsRef, commentId));
  },
};
