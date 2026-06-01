import type { ComboNote, LogicalInput } from '@/types/combo';

export function matchesNoteInput(note: ComboNote, pressedInputs: Set<LogicalInput>): boolean {
  const hasDirections = note.directions.every((direction) => pressedInputs.has(direction));
  const hasButtons = note.buttons.every((button) => pressedInputs.has(button));

  return hasDirections && hasButtons;
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
