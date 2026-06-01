<script setup lang="ts">
import type { TrainingStats } from '@/stores/trainingStore';

defineProps<{
  stats: TrainingStats;
  accuracy: number;
}>();
</script>

<template>
  <section class="stats-panel" aria-label="Training stats">
    <div>
      <span>Hits</span>
      <strong>{{ stats.hits }}</strong>
    </div>
    <div>
      <span>Miss</span>
      <strong>{{ stats.misses }}</strong>
    </div>
    <div>
      <span>Accuracy</span>
      <strong>{{ accuracy }}%</strong>
    </div>
    <div>
      <span>Streak</span>
      <strong>{{ stats.currentStreak }}</strong>
    </div>
    <div>
      <span>Best</span>
      <strong>{{ stats.bestStreak }}</strong>
    </div>
  </section>
</template>
