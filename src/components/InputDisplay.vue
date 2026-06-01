<script setup lang="ts">
import { computed } from 'vue';
import type { LogicalInput } from '@/types/combo';
import { formatInput } from '@/utils/inputMatcher';

const props = defineProps<{
  pressedInputs: LogicalInput[];
}>();

const display = computed(() => formatInput(props.pressedInputs));
</script>

<template>
  <section class="input-display" aria-label="Current input">
    <span class="panel-label">Input</span>
    <strong>{{ display }}</strong>
    <div class="key-row">
      <kbd>Arrows</kbd>
      <kbd>Z</kbd>
      <kbd>X</kbd>
      <kbd>C</kbd>
      <kbd>V</kbd>
    </div>
  </section>
</template>
