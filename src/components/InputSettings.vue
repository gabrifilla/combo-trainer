<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import {
  formatGamepadButton,
  formatKeyboardCode,
  inputCommands,
  useInputSettingsStore,
} from '@/stores/inputSettingsStore';
import { formatInput } from '@/utils/inputMatcher';
import type { LogicalInput, PlayerSide } from '@/types/combo';

const emit = defineEmits<{
  captureChange: [isCapturing: boolean];
}>();

const inputSettings = useInputSettingsStore();
const captureMode = ref<'keyboard' | 'gamepad' | null>(null);
const captureInput = ref<LogicalInput | null>(null);
let gamepadFrame = 0;
let baselineButtons = new Set<number>();

const captureLabel = computed(() => {
  if (!captureMode.value || !captureInput.value) return '';
  return `${formatInput([captureInput.value])} - ${captureMode.value === 'keyboard' ? 'press a key' : 'press a button'}`;
});

function stopGamepadCapture() {
  if (gamepadFrame) {
    window.cancelAnimationFrame(gamepadFrame);
    gamepadFrame = 0;
  }
}

function stopCapture() {
  window.removeEventListener('keydown', onKeyboardCapture, true);
  stopGamepadCapture();
  captureMode.value = null;
  captureInput.value = null;
  baselineButtons = new Set();
  emit('captureChange', false);
}

function pressedGamepadButtons() {
  const buttons = new Set<number>();

  for (const gamepad of navigator.getGamepads()) {
    if (!gamepad?.connected) continue;

    gamepad.buttons.forEach((button, index) => {
      if (button.pressed) buttons.add(index);
    });
  }

  return buttons;
}

function pollGamepadCapture() {
  if (captureMode.value !== 'gamepad' || !captureInput.value) return;

  const pressedButtons = pressedGamepadButtons();
  const selectedButton = Array.from(pressedButtons).find((button) => !baselineButtons.has(button));

  if (selectedButton !== undefined) {
    inputSettings.setGamepadButtonBinding(captureInput.value, selectedButton);
    stopCapture();
    return;
  }

  gamepadFrame = window.requestAnimationFrame(pollGamepadCapture);
}

function onKeyboardCapture(event: KeyboardEvent) {
  if (captureMode.value !== 'keyboard' || !captureInput.value) return;

  event.preventDefault();
  event.stopPropagation();
  inputSettings.setKeyboardBinding(captureInput.value, event.code);
  stopCapture();
}

function startKeyboardCapture(input: LogicalInput) {
  stopCapture();
  captureMode.value = 'keyboard';
  captureInput.value = input;
  emit('captureChange', true);
  window.addEventListener('keydown', onKeyboardCapture, true);
}

function startGamepadCapture(input: LogicalInput) {
  stopCapture();
  captureMode.value = 'gamepad';
  captureInput.value = input;
  baselineButtons = pressedGamepadButtons();
  emit('captureChange', true);
  gamepadFrame = window.requestAnimationFrame(pollGamepadCapture);
}

function setPlayerSide(side: PlayerSide) {
  inputSettings.setPlayerSide(side);
}

onBeforeUnmount(stopCapture);
</script>

<template>
  <section class="settings-panel" aria-label="Input settings">
    <div class="settings-header">
      <span class="panel-label">Controls</span>
      <button class="text-button" type="button" @click="inputSettings.resetBindings">Reset</button>
    </div>

    <div class="side-toggle" aria-label="Player side">
      <button
        type="button"
        :class="{ active: inputSettings.playerSide === 'P1' }"
        @click="setPlayerSide('P1')"
      >
        P1
      </button>
      <button
        type="button"
        :class="{ active: inputSettings.playerSide === 'P2' }"
        @click="setPlayerSide('P2')"
      >
        P2
      </button>
    </div>

    <div class="binding-list">
      <div v-for="input in inputCommands" :key="input" class="binding-row">
        <strong>{{ formatInput([input]) }}</strong>
        <button class="binding-button" type="button" @click="startKeyboardCapture(input)">
          {{ formatKeyboardCode(inputSettings.bindings.keyboard[input]) || 'None' }}
        </button>
        <button class="binding-button" type="button" @click="startGamepadCapture(input)">
          {{ formatGamepadButton(inputSettings.bindings.gamepadButtons[input]) }}
        </button>
      </div>
    </div>

    <small v-if="captureLabel" class="capture-status">{{ captureLabel }}</small>
  </section>
</template>
