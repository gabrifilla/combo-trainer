<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { getCombosByCharacter } from '@/data/combos';
import { useTrainingStore } from '@/stores/trainingStore';

const props = defineProps<{ character: string }>();
const router = useRouter();
const training = useTrainingStore();
const characterCombos = computed(() => getCombosByCharacter(props.character));

function startCombo(comboId: string) {
  const combo = characterCombos.value.find((item) => item.id === comboId);
  if (combo) training.selectCombo(combo);
  router.push({ name: 'training', params: { comboId } });
}
</script>

<template>
  <main class="screen">
    <header class="app-header compact">
      <div>
        <p class="eyebrow">{{ character }}</p>
        <h1>Select Combo</h1>
      </div>
      <RouterLink class="ghost-button" to="/">Back</RouterLink>
    </header>

    <section v-if="characterCombos.length === 0" class="empty-panel">
      <span class="panel-label">No combos yet</span>
      <p>Combo data for {{ character }} is not registered in the JSON file yet.</p>
    </section>

    <section class="combo-list" aria-label="Combo selection">
      <button
        v-for="combo in characterCombos"
        :key="combo.id"
        class="combo-row"
        type="button"
        @click="startCombo(combo.id)"
      >
        <span>
          <strong>{{ combo.name }}</strong>
          <small>{{ combo.category ?? 'Combo' }} - {{ combo.notes.length }} commands - {{ combo.difficulty }}</small>
        </span>
        <span class="combo-preview">{{ combo.notation ?? combo.notes.map((note) => note.label).join('  ') }}</span>
      </button>
    </section>
  </main>
</template>
