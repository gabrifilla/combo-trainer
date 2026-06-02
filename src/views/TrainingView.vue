<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import GameStage from '@/components/GameStage.vue';
import InputDisplay from '@/components/InputDisplay.vue';
import InputSettings from '@/components/InputSettings.vue';
import StatsPanel from '@/components/StatsPanel.vue';
import { getComboById } from '@/data/combos';
import { useGameLoop } from '@/composables/useGameLoop';
import { usePlayerInput } from '@/composables/usePlayerInput';
import { useTrainingStore } from '@/stores/trainingStore';
import { matchesNoteInput } from '@/utils/inputMatcher';
import { judgeTiming } from '@/utils/timingJudge';
import type { AttackInput, ComboNote, JudgeResult, LogicalInput } from '@/types/combo';

const props = defineProps<{ comboId: string }>();
const router = useRouter();
const training = useTrainingStore();
const combo = computed(() => getComboById(props.comboId));

const currentTime = ref(0);
const startedAt = ref(0);
const running = ref(false);
const isCapturingInput = ref(false);
const noteStates = ref<Record<string, JudgeResult | 'pending'>>({});
const flashResult = ref<JudgeResult | null>(null);
let popupTimeout = 0;

function resetNoteStates() {
  noteStates.value = Object.fromEntries((combo.value?.notes ?? []).map((note) => [note.id, 'pending']));
}

function showResult(result: JudgeResult) {
  flashResult.value = result;
  window.clearTimeout(popupTimeout);
  popupTimeout = window.setTimeout(() => {
    flashResult.value = null;
  }, 450);
}

function record(note: ComboNote, result: JudgeResult) {
  if (noteStates.value[note.id] !== 'pending') return;
  noteStates.value = { ...noteStates.value, [note.id]: result };
  training.recordJudge(result);
  showResult(result);
}

function findClosestPendingNote() {
  if (!combo.value) return null;
  const maxWindow = combo.value.hitWindow.good;

  return combo.value.notes
    .filter((note) => noteStates.value[note.id] === 'pending')
    .map((note) => ({ note, delta: currentTime.value - note.time }))
    .filter((item) => Math.abs(item.delta) <= maxWindow)
    .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta))[0] ?? null;
}

function handleAttack(_button: AttackInput, pressedInputs: Set<LogicalInput>) {
  if (!running.value || !combo.value) return;

  const candidate = findClosestPendingNote();
  if (!candidate) return;

  if (!matchesNoteInput(candidate.note, pressedInputs)) {
    record(candidate.note, 'Miss');
    return;
  }

  const result = judgeTiming(candidate.delta, combo.value.hitWindow);
  record(candidate.note, result ?? 'Miss');
}

const { pressedInputs, isGamepadConnected, gamepadName } = usePlayerInput(handleAttack, {
  enabled: computed(() => !isCapturingInput.value),
});

const renderNotes = computed(() => {
  if (!combo.value) return [];
  const hitLine = 0.82;

  return combo.value.notes
    .map((note) => {
      const visibleStart = note.time - combo.value!.approachTime / combo.value!.scrollSpeed;
      const rawProgress = (currentTime.value - visibleStart) / (note.time - visibleStart);
      const progress = rawProgress * hitLine;
      return {
        id: note.id,
        label: note.label,
        progress,
        state: noteStates.value[note.id] ?? 'pending',
      };
    })
    .filter((note) => note.progress >= -0.12 && note.progress <= 1.12 && note.state === 'pending');
});

const upcomingNotes = computed(() => {
  if (!combo.value) return [];
  return combo.value.notes
    .filter((note) => noteStates.value[note.id] === 'pending' && note.time >= currentTime.value - 100)
    .slice(0, 5);
});

const currentCommand = computed(() => upcomingNotes.value[0]?.label ?? 'Done');

function tick(now: number) {
  if (!running.value || !combo.value) return;
  currentTime.value = now - startedAt.value;

  for (const note of combo.value.notes) {
    if (noteStates.value[note.id] === 'pending' && currentTime.value > note.time + combo.value.hitWindow.good) {
      record(note, 'Miss');
    }
  }

  const lastNoteTime = combo.value.notes.at(-1)?.time ?? 0;
  if (currentTime.value > lastNoteTime + 900) {
    running.value = false;
  }
}

const loop = useGameLoop(tick);

async function restart() {
  if (!combo.value) return;
  training.selectCombo(combo.value);
  resetNoteStates();
  currentTime.value = 0;
  running.value = false;
  await nextTick();
  startedAt.value = performance.now();
  running.value = true;
  loop.start();
}

function backToCombos() {
  if (!combo.value) {
    router.push('/');
    return;
  }
  router.push({ name: 'combos', params: { character: combo.value.character } });
}

onMounted(() => {
  if (!combo.value) {
    router.replace('/');
    return;
  }
  restart();
});
</script>

<template>
  <main v-if="combo" class="training-layout">
    <section class="training-main">
      <header class="training-header">
        <button class="ghost-button" type="button" @click="backToCombos">Back</button>
        <div>
          <p class="eyebrow">{{ combo.character }}</p>
          <h1>{{ combo.name }}</h1>
        </div>
        <button class="primary-button" type="button" @click="restart">Restart</button>
      </header>

      <GameStage :combo="combo" :render-notes="renderNotes" :result="flashResult" />
    </section>

    <aside class="training-side">
      <section class="now-panel">
        <span class="panel-label">Current</span>
        <strong>{{ currentCommand }}</strong>
        <div class="upcoming-list">
          <span v-for="note in upcomingNotes" :key="note.id">{{ note.label }}</span>
        </div>
      </section>
      <InputDisplay
        :pressed-inputs="pressedInputs"
        :gamepad-name="gamepadName"
        :is-gamepad-connected="isGamepadConnected"
      />
      <InputSettings @capture-change="isCapturingInput = $event" />
      <StatsPanel :stats="training.stats" :accuracy="training.accuracy" />
    </aside>
  </main>
</template>
