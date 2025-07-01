import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const STORAGE_KEY = 'cefr_levels_selected';
const DYNAMIC_CHECK_KEY = 'cefr_dynamic_check';

interface CEFRSettingsState {
  selectedLevels: string[];
  dynamicCheck: boolean;
  setSelectedLevels: (levels: string[]) => void;
  setDynamicCheck: (val: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useCEFRSettings = create<CEFRSettingsState>((set) => ({
  selectedLevels: CEFR_LEVELS,
  dynamicCheck: false,
  setSelectedLevels: (levels) => {
    const sorted = [...levels].sort((a, b) => CEFR_LEVELS.indexOf(a) - CEFR_LEVELS.indexOf(b));
    set({ selectedLevels: sorted });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  },
  setDynamicCheck: (val) => {
    set({ dynamicCheck: val });
    AsyncStorage.setItem(DYNAMIC_CHECK_KEY, String(val));
    if (val) {
      set({ selectedLevels: [] });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  },
  hydrate: async () => {
    const levels = await AsyncStorage.getItem(STORAGE_KEY);
    const dynamic = await AsyncStorage.getItem(DYNAMIC_CHECK_KEY);
    const parsedLevels = levels ? JSON.parse(levels) : CEFR_LEVELS;
    const sorted = [...parsedLevels].sort((a, b) => CEFR_LEVELS.indexOf(a) - CEFR_LEVELS.indexOf(b));
    set({
      selectedLevels: sorted,
      dynamicCheck: dynamic === 'true',
    });
  },
}));

// This file only exports the Zustand store, not a React component.
// No default export is needed or appropriate here.
