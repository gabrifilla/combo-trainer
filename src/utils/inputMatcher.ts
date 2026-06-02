import type { AttackInput, ComboNote, LogicalInput } from '@/types/combo';

const attackInputs: AttackInput[] = ['1', '2', '3', '4'];

export function requiresPlayerAttack(note: ComboNote): boolean {
  return (note.kind ?? 'attack') === 'attack' && note.buttons.length > 0;
}

export function matchesNoteInput(note: ComboNote, pressedInputs: Set<LogicalInput>): boolean {
  if (!requiresPlayerAttack(note)) return false;

  const hasDirections = note.directions.every((direction) => pressedInputs.has(direction));
  const pressedButtons = attackInputs.filter((button) => pressedInputs.has(button));
  const hasExactButtons =
    pressedButtons.length === note.buttons.length && note.buttons.every((button) => pressedInputs.has(button));

  return hasDirections && hasExactButtons;
}

export function canWaitForMoreButtons(note: ComboNote, pressedInputs: Set<LogicalInput>): boolean {
  if (note.buttons.length <= 1) return false;

  const pressedButtons = attackInputs.filter((button) => pressedInputs.has(button));
  return pressedButtons.length < note.buttons.length && pressedButtons.every((button) => note.buttons.includes(button));
}

export function formatInput(inputs: LogicalInput[]) {
  if (inputs.length === 0) return 'neutral';
  return inputs
    .map((input) => {
      if (input === 'forward') return 'f';
      if (input === 'back') return 'b';
      if (input === 'down') return 'd';
      if (input === 'up') return 'u';
      return input;
    })
    .join(' + ');
}
