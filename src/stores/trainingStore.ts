import { defineStore } from 'pinia';
import type { ComboDefinition, JudgeResult } from '@/types/combo';

export interface TrainingStats {
  hits: number;
  misses: number;
  currentStreak: number;
  bestStreak: number;
  judged: number;
  score: number;
}

const initialStats = (): TrainingStats => ({
  hits: 0,
  misses: 0,
  currentStreak: 0,
  bestStreak: 0,
  judged: 0,
  score: 0,
});

export const useTrainingStore = defineStore('training', {
  state: () => ({
    selectedComboId: '',
    selectedCombo: null as ComboDefinition | null,
    stats: initialStats(),
    lastResult: null as JudgeResult | null,
  }),
  getters: {
    accuracy: (state) => {
      if (state.stats.judged === 0) return 100;
      return Math.round((state.stats.hits / state.stats.judged) * 100);
    },
  },
  actions: {
    selectCombo(combo: ComboDefinition) {
      this.selectedCombo = combo;
      this.selectedComboId = combo.id;
      this.resetStats();
    },
    resetStats() {
      this.stats = initialStats();
      this.lastResult = null;
    },
    recordJudge(result: JudgeResult) {
      this.lastResult = result;
      this.stats.judged += 1;

      if (result === 'Miss') {
        this.stats.misses += 1;
        this.stats.currentStreak = 0;
        return;
      }

      this.stats.hits += 1;
      this.stats.currentStreak += 1;
      this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.currentStreak);
      this.stats.score += result === 'Perfect' ? 1000 : result === 'Great' ? 700 : 400;
    },
  },
});
