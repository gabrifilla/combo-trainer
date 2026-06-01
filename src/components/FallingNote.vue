<script setup lang="ts">
import type { JudgeResult } from '@/types/combo';

defineProps<{
  label: string;
  progress: number;
  state?: JudgeResult | 'pending';
}>();
</script>

<template>
  <div
    class="falling-note"
    :class="[`state-${state ?? 'pending'}`]"
    :style="{ top: `${progress * 100}%` }"
  >
    {{ label }}
  </div>
</template>
