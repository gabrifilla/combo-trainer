export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type DirectionInput = 'forward' | 'back' | 'up' | 'down';
export type AttackInput = '1' | '2' | '3' | '4';
export type LogicalInput = DirectionInput | AttackInput;
export type InputBindings = {
  keyboard: Record<LogicalInput, string>;
  gamepadButtons: Record<LogicalInput, number[]>;
};
export type PlayerSide = 'P1' | 'P2';
export type JudgeResult = 'Perfect' | 'Great' | 'Good' | 'Miss';

export interface HitWindow {
  perfect: number;
  great: number;
  good: number;
}

export interface ComboNote {
  id: string;
  label: string;
  time: number;
  directions: DirectionInput[];
  buttons: AttackInput[];
}

export interface ComboDefinition {
  id: string;
  character: string;
  name: string;
  difficulty: Difficulty;
  category?: string;
  notation?: string;
  source?: string;
  scrollSpeed: number;
  approachTime: number;
  hitWindow: HitWindow;
  notes: ComboNote[];
}

export interface Fighter {
  id: string;
  name: string;
  archetype: string;
  accent: string;
}
