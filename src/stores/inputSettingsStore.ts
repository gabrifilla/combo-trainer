import { defineStore } from 'pinia';
import type { InputBindings, LogicalInput, PlayerSide } from '@/types/combo';

const storageKey = 'combo-trainer-input-bindings';
const sideStorageKey = 'combo-trainer-player-side';
export const inputCommands: LogicalInput[] = ['up', 'down', 'back', 'forward', '1', '2', '3', '4'];

export function defaultInputBindings(): InputBindings {
  return {
    keyboard: {
      up: 'ArrowUp',
      down: 'ArrowDown',
      back: 'ArrowLeft',
      forward: 'ArrowRight',
      1: 'KeyZ',
      2: 'KeyX',
      3: 'KeyC',
      4: 'KeyV',
    },
    gamepadButtons: {
      up: [12],
      down: [13],
      back: [14],
      forward: [15],
      1: [0],
      2: [1],
      3: [2],
      4: [3],
    },
  };
}

function isLogicalInput(input: string): input is LogicalInput {
  return inputCommands.includes(input as LogicalInput);
}

function loadBindings(): InputBindings {
  const defaults = defaultInputBindings();
  const raw = localStorage.getItem(storageKey);
  if (!raw) return defaults;

  try {
    const saved = JSON.parse(raw) as Partial<InputBindings>;
    const bindings = defaultInputBindings();

    for (const [input, code] of Object.entries(saved.keyboard ?? {})) {
      if (isLogicalInput(input) && typeof code === 'string') {
        bindings.keyboard[input] = code;
      }
    }

    for (const [input, buttons] of Object.entries(saved.gamepadButtons ?? {})) {
      if (isLogicalInput(input) && Array.isArray(buttons)) {
        bindings.gamepadButtons[input] = buttons.filter((button) => Number.isInteger(button) && button >= 0);
      }
    }

    return bindings;
  } catch {
    return defaults;
  }
}

function saveBindings(bindings: InputBindings) {
  localStorage.setItem(storageKey, JSON.stringify(bindings));
}

function loadPlayerSide(): PlayerSide {
  const savedSide = localStorage.getItem(sideStorageKey);
  return savedSide === 'P2' ? 'P2' : 'P1';
}

function savePlayerSide(side: PlayerSide) {
  localStorage.setItem(sideStorageKey, side);
}

export function formatKeyboardCode(code: string) {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Arrow')) return code.replace('Arrow', '');
  if (code === 'Space') return 'Space';
  return code;
}

export function formatGamepadButton(buttons: number[]) {
  return buttons.length > 0 ? buttons.map((button) => `B${button}`).join(' / ') : 'None';
}

export const useInputSettingsStore = defineStore('inputSettings', {
  state: () => ({
    bindings: loadBindings(),
    playerSide: loadPlayerSide(),
  }),
  actions: {
    setPlayerSide(side: PlayerSide) {
      this.playerSide = side;
      savePlayerSide(side);
    },
    setKeyboardBinding(input: LogicalInput, code: string) {
      for (const command of inputCommands) {
        if (this.bindings.keyboard[command] === code) {
          this.bindings.keyboard[command] = '';
        }
      }

      this.bindings.keyboard[input] = code;
      saveBindings(this.bindings);
    },
    setGamepadButtonBinding(input: LogicalInput, button: number) {
      for (const command of inputCommands) {
        this.bindings.gamepadButtons[command] = this.bindings.gamepadButtons[command].filter((item) => item !== button);
      }

      this.bindings.gamepadButtons[input] = [button];
      saveBindings(this.bindings);
    },
    resetBindings() {
      this.bindings = defaultInputBindings();
      saveBindings(this.bindings);
    },
  },
});
