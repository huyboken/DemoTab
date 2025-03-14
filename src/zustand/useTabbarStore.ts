import {create} from 'zustand';
import {Animated} from 'react-native';

interface CombinedStore {
  changeBottomTab: {index: number; color: string};
  wallets: any[];
  budgets: any[];
  setChangeBottomTab: (index: number, color: string) => void;
  setWallets: (wallets: any[]) => void;
  setBudgets: (budgets: any[]) => void;

  translateX: Animated.Value;
  setTranslateX: (value: Animated.Value) => void;
}

export const useTabbarStore = create<CombinedStore>(set => ({
  changeBottomTab: {index: 0, color: 'white'},
  wallets: [],
  budgets: [],
  translateX: new Animated.Value(0),

  setChangeBottomTab: (index, color) => set({changeBottomTab: {index, color}}),
  setWallets: wallets => set({wallets}),
  setBudgets: budgets => set({budgets}),
  setTranslateX: value => set({translateX: value}),
}));
