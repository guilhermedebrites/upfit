import { create } from 'zustand';
import { progressionService } from '../services/progression.service';
import type { ProgressionDto } from '../types/progression.types';

interface ProgressionStore {
  progression: ProgressionDto | null;
  fetch: (userId: string) => Promise<void>;
  clear: () => void;
}

/**
 * Cache leve de progressão — compartilhado entre todas as telas.
 * Qualquer tela pode chamar `fetch(userId)` e ler `progression` sem
 * depender de prop drilling nem de refetch por tab.
 */
export const useProgressionStore = create<ProgressionStore>((set) => ({
  progression: null,

  fetch: async (userId: string) => {
    try {
      const data = await progressionService.get(userId);
      set({ progression: data });
    } catch {
      // silencioso — mantém dado anterior se existir
    }
  },

  clear: () => set({ progression: null }),
}));
