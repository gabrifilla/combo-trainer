import { computed, onBeforeUnmount, onMounted, ref, toValue, type MaybeRefOrGetter } from 'vue';
import { inputCommands, useInputSettingsStore } from '@/stores/inputSettingsStore';
import type { AttackInput, LogicalInput, PlayerSide } from '@/types/combo';

const attackInputs: AttackInput[] = ['1', '2', '3', '4'];
const inputOrder: LogicalInput[] = ['up', 'down', 'back', 'forward', '1', '2', '3', '4'];
const resetButtons = [8, 9];
const stickThreshold = 0.45;

interface PlayerInputOptions {
  enabled?: MaybeRefOrGetter<boolean>;
  onReset?: () => void;
}

function isAttackInput(input: LogicalInput): input is AttackInput {
  return attackInputs.includes(input as AttackInput);
}

function inputEnabled(options?: PlayerInputOptions) {
  return options?.enabled === undefined ? true : toValue(options.enabled);
}

function sideAdjustedInput(input: LogicalInput, side: PlayerSide): LogicalInput {
  if (input === 'forward') return side === 'P1' ? 'forward' : 'back';
  if (input === 'back') return side === 'P1' ? 'back' : 'forward';
  return input;
}

function mapKeyboardInput(code: string, settings: ReturnType<typeof useInputSettingsStore>): LogicalInput | null {
  for (const input of inputCommands) {
    if (settings.bindings.keyboard[input] === code) return sideAdjustedInput(input, settings.playerSide);
  }

  return null;
}

function horizontalInput(value: number, side: PlayerSide): LogicalInput | null {
  if (value > stickThreshold) return side === 'P1' ? 'forward' : 'back';
  if (value < -stickThreshold) return side === 'P1' ? 'back' : 'forward';
  return null;
}

function orderedInputs(pressedSet: Set<LogicalInput>) {
  return inputOrder.filter((input) => pressedSet.has(input));
}

function sameInputs(left: LogicalInput[], right: LogicalInput[]) {
  return left.length === right.length && left.every((input, index) => input === right[index]);
}

export function usePlayerInput(
  onAttack?: (button: AttackInput, pressedInputs: Set<LogicalInput>) => void,
  options?: PlayerInputOptions,
) {
  const inputSettings = useInputSettingsStore();
  const pressedInputs = ref<LogicalInput[]>([]);
  const keyboardPressed = new Set<LogicalInput>();
  const gamepadPressed = new Set<LogicalInput>();
  const activeGamepadIndex = ref<number | null>(null);
  const gamepadName = ref('');
  const previousGamepadAttacks = new Set<AttackInput>();
  const previousResetButtons = new Set<number>();
  let animationFrame = 0;

  const combinedPressed = () => new Set<LogicalInput>([...keyboardPressed, ...gamepadPressed]);

  const sync = () => {
    const nextInputs = orderedInputs(combinedPressed());
    if (!sameInputs(pressedInputs.value, nextInputs)) {
      pressedInputs.value = nextInputs;
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!inputEnabled(options)) return;

    const input = mapKeyboardInput(event.code, inputSettings);
    if (!input) return;

    event.preventDefault();
    keyboardPressed.add(input);
    sync();

    if (!event.repeat && isAttackInput(input)) {
      onAttack?.(input, combinedPressed());
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    const input = mapKeyboardInput(event.code, inputSettings);
    if (!input) return;

    event.preventDefault();
    keyboardPressed.delete(input);
    sync();
  };

  const selectGamepad = (gamepad: Gamepad | null) => {
    activeGamepadIndex.value = gamepad?.index ?? null;
    gamepadName.value = gamepad?.id ?? '';
  };

  const findActiveGamepad = () => {
    const pads = navigator.getGamepads();
    if (activeGamepadIndex.value !== null) {
      const current = pads[activeGamepadIndex.value];
      if (current?.connected) return current;
    }

    return Array.from(pads).find((pad): pad is Gamepad => Boolean(pad?.connected)) ?? null;
  };

  const readGamepad = () => {
    const gamepad = findActiveGamepad();
    if (!gamepad) {
      gamepadPressed.clear();
      previousGamepadAttacks.clear();
      previousResetButtons.clear();
      selectGamepad(null);
      sync();
      return;
    }

    selectGamepad(gamepad);

    if (!inputEnabled(options)) {
      gamepadPressed.clear();
      previousGamepadAttacks.clear();
      previousResetButtons.clear();
      sync();
      return;
    }

    gamepadPressed.clear();

    const horizontal = horizontalInput(gamepad.axes[0] ?? 0, inputSettings.playerSide);
    if (horizontal) gamepadPressed.add(horizontal);

    const vertical = gamepad.axes[1] ?? 0;
    if (vertical > stickThreshold) gamepadPressed.add('down');
    if (vertical < -stickThreshold) gamepadPressed.add('up');

    const currentGamepadAttacks = new Set<AttackInput>();
    for (const input of inputCommands) {
      const isPressed = inputSettings.bindings.gamepadButtons[input].some((buttonIndex) => {
        return gamepad.buttons[buttonIndex]?.pressed;
      });

      if (isPressed) {
        gamepadPressed.add(sideAdjustedInput(input, inputSettings.playerSide));
        if (isAttackInput(input)) {
          currentGamepadAttacks.add(input);
        }
      }
    }

    sync();

    for (const buttonIndex of resetButtons) {
      const isPressed = Boolean(gamepad.buttons[buttonIndex]?.pressed);
      if (isPressed && !previousResetButtons.has(buttonIndex)) {
        options?.onReset?.();
      }
    }

    previousResetButtons.clear();
    resetButtons.forEach((buttonIndex) => {
      if (gamepad.buttons[buttonIndex]?.pressed) {
        previousResetButtons.add(buttonIndex);
      }
    });

    for (const input of currentGamepadAttacks) {
      if (!previousGamepadAttacks.has(input)) {
        onAttack?.(input, combinedPressed());
      }
    }

    previousGamepadAttacks.clear();
    currentGamepadAttacks.forEach((input) => previousGamepadAttacks.add(input));
  };

  const pollGamepad = () => {
    readGamepad();
    animationFrame = window.requestAnimationFrame(pollGamepad);
  };

  const onGamepadConnected = (event: GamepadEvent) => {
    selectGamepad(event.gamepad);
  };

  const onGamepadDisconnected = (event: GamepadEvent) => {
    if (event.gamepad.index !== activeGamepadIndex.value) return;
    selectGamepad(null);
    gamepadPressed.clear();
    previousGamepadAttacks.clear();
    previousResetButtons.clear();
    sync();
  };

  const pressedLabel = computed(() => pressedInputs.value.join(' + ') || 'neutral');
  const isGamepadConnected = computed(() => activeGamepadIndex.value !== null);

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('gamepadconnected', onGamepadConnected);
    window.addEventListener('gamepaddisconnected', onGamepadDisconnected);
    animationFrame = window.requestAnimationFrame(pollGamepad);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('gamepadconnected', onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', onGamepadDisconnected);
    window.cancelAnimationFrame(animationFrame);
  });

  return { pressedInputs, pressedLabel, isGamepadConnected, gamepadName };
}
