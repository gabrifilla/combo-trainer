<script setup lang="ts">
import { computed } from 'vue';
import {
  formatGamepadButton,
  formatKeyboardCode,
  inputCommands,
  useInputSettingsStore,
} from '@/stores/inputSettingsStore';
import type { LogicalInput } from '@/types/combo';
import { formatInput } from '@/utils/inputMatcher';

const props = defineProps<{
  pressedInputs: LogicalInput[];
  isGamepadConnected: boolean;
  gamepadName: string;
}>();

const inputSettings = useInputSettingsStore();
const display = computed(() => formatInput(props.pressedInputs));
const bindingSummary = computed(() => {
  return inputCommands.map((input) => {
    const keyboard = formatKeyboardCode(inputSettings.bindings.keyboard[input]) || 'None';
    const gamepad = formatGamepadButton(inputSettings.bindings.gamepadButtons[input]);
    return `${formatInput([input])}: ${keyboard}/${gamepad}`;
  });
});
</script>

<template>
  <section class="input-display" aria-label="Current input">
    <span class="panel-label">Input</span>
    <strong>{{ display }}</strong>
    <small class="input-source">
      {{ isGamepadConnected ? gamepadName || 'Gamepad connected' : 'Keyboard active' }}
    </small>
    <div class="key-row">
      <kbd v-for="binding in bindingSummary" :key="binding">{{ binding }}</kbd>
    </div>
  </section>
</template>
