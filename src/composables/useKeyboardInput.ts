import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { AttackInput, LogicalInput, PlayerSide } from '@/types/combo';

const attackKeys: Record<string, AttackInput> = {
  KeyZ: '1',
  KeyX: '2',
  KeyC: '3',
  KeyV: '4',
};

function mapKey(code: string, side: PlayerSide): LogicalInput | null {
  if (code in attackKeys) return attackKeys[code];
  if (code === 'ArrowUp') return 'up';
  if (code === 'ArrowDown') return 'down';
  if (code === 'ArrowRight') return side === 'P1' ? 'forward' : 'back';
  if (code === 'ArrowLeft') return side === 'P1' ? 'back' : 'forward';
  return null;
}

export function useKeyboardInput(
  onAttack?: (button: AttackInput, pressedInputs: Set<LogicalInput>) => void,
  side: PlayerSide = 'P1',
) {
  const pressedInputs = ref<LogicalInput[]>([]);
  const pressedSet = new Set<LogicalInput>();

  const sync = () => {
    pressedInputs.value = Array.from(pressedSet);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const input = mapKey(event.code, side);
    if (!input) return;

    event.preventDefault();
    pressedSet.add(input);
    sync();

    if (!event.repeat && input in { 1: true, 2: true, 3: true, 4: true }) {
      onAttack?.(input as AttackInput, new Set(pressedSet));
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    const input = mapKey(event.code, side);
    if (!input) return;

    event.preventDefault();
    pressedSet.delete(input);
    sync();
  };

  const pressedLabel = computed(() => pressedInputs.value.join(' + ') || 'neutral');

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  });

  return { pressedInputs, pressedLabel };
}
