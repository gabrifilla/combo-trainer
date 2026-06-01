<script setup lang="ts">
import type { ComboDefinition, JudgeResult } from '@/types/combo';
import FallingNote from './FallingNote.vue';
import HitZone from './HitZone.vue';
import ResultPopup from './ResultPopup.vue';

interface RenderNote {
  id: string;
  label: string;
  progress: number;
  state: JudgeResult | 'pending';
}

defineProps<{
  combo: ComboDefinition;
  renderNotes: RenderNote[];
  result: JudgeResult | null;
}>();
</script>

<template>
  <section class="game-stage" aria-label="Combo timeline">
    <div class="lane-grid" />
    <FallingNote
      v-for="note in renderNotes"
      :key="note.id"
      :label="note.label"
      :progress="note.progress"
      :state="note.state"
    />
    <ResultPopup :result="result" />
    <HitZone />
  </section>
</template>
