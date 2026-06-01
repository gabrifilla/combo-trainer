<script setup lang="ts">
import type { JudgeResult } from '@/types/combo';

defineProps<{
  result: JudgeResult | null;
}>();
</script>

<template>
  <Transition name="pop" mode="out-in">
    <div v-if="result" :key="result" class="result-popup" :class="`result-${result}`">
      {{ result }}
    </div>
  </Transition>
</template>
