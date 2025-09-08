import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Coffee, Recipe, CoffeeConsumption, DashboardData } from '@/types';

interface CoffeeStore {
  // 사용자 상태
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // 커피 데이터
  coffees: Coffee[];
  recipes: Recipe[];
  consumptions: CoffeeConsumption[];
  
  // 대시보드 데이터
  dashboardData: DashboardData | null;
  
  // 액션들
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setCoffees: (coffees: Coffee[]) => void;
  addCoffee: (coffee: Coffee) => void;
  updateCoffee: (id: string, updates: Partial<Coffee>) => void;
  removeCoffee: (id: string) => void;
  
  setRecipes: (recipes: Recipe[]) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  removeRecipe: (id: string) => void;
  
  setConsumptions: (consumptions: CoffeeConsumption[]) => void;
  addConsumption: (consumption: CoffeeConsumption) => void;
  
  setDashboardData: (data: DashboardData) => void;
  
  // 계산된 값들
  getTotalWeight: () => number;
  getTodayConsumption: () => number;
  getWeeklyConsumption: () => number;
  getMonthlyConsumption: () => number;
}

export const useCoffeeStore = create<CoffeeStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      isAuthenticated: false,
      isLoading: false,
      coffees: [],
      recipes: [],
      consumptions: [],
      dashboardData: null,
      
      // 액션들
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      
      setCoffees: (coffees) => set({ coffees }),
      addCoffee: (coffee) => set((state) => ({ coffees: [...state.coffees, coffee] })),
      updateCoffee: (id, updates) => set((state) => ({
        coffees: state.coffees.map(coffee => 
          coffee.id === id ? { ...coffee, ...updates } : coffee
        )
      })),
      removeCoffee: (id) => set((state) => ({
        coffees: state.coffees.filter(coffee => coffee.id !== id)
      })),
      
      setRecipes: (recipes) => set({ recipes }),
      addRecipe: (recipe) => set((state) => ({ recipes: [...state.recipes, recipe] })),
      updateRecipe: (id, updates) => set((state) => ({
        recipes: state.recipes.map(recipe => 
          recipe.id === id ? { ...recipe, ...updates } : recipe
        )
      })),
      removeRecipe: (id) => set((state) => ({
        recipes: state.recipes.filter(recipe => recipe.id !== id)
      })),
      
      setConsumptions: (consumptions) => set({ consumptions }),
      addConsumption: (consumption) => set((state) => ({ 
        consumptions: [...state.consumptions, consumption] 
      })),
      
      setDashboardData: (dashboardData) => set({ dashboardData }),
      
      // 계산된 값들
      getTotalWeight: () => {
        const { coffees } = get();
        return coffees.reduce((total, coffee) => total + coffee.currentWeight, 0);
      },
      
      getTodayConsumption: () => {
        const { consumptions } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return consumptions.filter(consumption => {
          const consumedAt = new Date(consumption.consumedAt);
          return consumedAt >= today && consumedAt < tomorrow;
        }).length;
      },
      
      getWeeklyConsumption: () => {
        const { consumptions } = get();
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        return consumptions.filter(consumption => {
          const consumedAt = new Date(consumption.consumedAt);
          return consumedAt >= weekAgo && consumedAt <= today;
        }).length;
      },
      
      getMonthlyConsumption: () => {
        const { consumptions } = get();
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        return consumptions.filter(consumption => {
          const consumedAt = new Date(consumption.consumedAt);
          return consumedAt >= monthAgo && consumedAt <= today;
        }).length;
      },
    }),
    {
      name: 'coffee-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        coffees: state.coffees,
        recipes: state.recipes,
        consumptions: state.consumptions,
      }),
    }
  )
);
