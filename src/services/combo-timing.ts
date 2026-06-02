export type Direction = 'up' | 'down' | 'back' | 'forward';

export type Button = '1' | '2' | '3' | '4';

export interface ComboNote {
  id: string;
  label: string;
  time: number;
  directions: Direction[];
  buttons: Button[];
  kind?: 'attack' | 'stance' | 'movement' | 'system';
  inputSequence?: Array<{
    directions: Direction[];
    buttons: Button[];
    frameOffset?: number;
  }>;
}

export interface HitWindow {
  perfect: number;
  great: number;
  good: number;
}

export interface ComboTimingConfig {
  source: 'manual' | 'video-60fps' | 'estimated-rule-v1';
  fps: number;
  startOffsetFrames: number;
  manualGapFrames?: number[];
}

export interface Combo {
  id: string;
  name: string;
  difficulty: string;
  category: string;
  notation: string;
  source: string;
  scrollSpeed: number;
  approachTime: number;
  hitWindow: HitWindow;
  timing?: ComboTimingConfig;
  notes: ComboNote[];
}

export type ComboDatabase = Record<string, Combo[]>;

const defaultFps = 60;
const defaultStartOffsetFrames = 54;
const stancePattern = /\b(DCK|PAB|FLK|LNH|SWA|WGS|DSS|HMS|DEW|SEN|UNS|ROL|BT|FC|WS|heat)\b/i;
const stanceOnlyPattern =
  /^(DCK|PAB|FLK|LNH|SWA|WGS|DSS|HMS|DEW|SEN|UNS|ROL|BT|FC|WS|MIA|MCR|SNK|HBS|LIB|IAI|PERF|HRS|SWS|CAT|KIN|RFF|LFS|Dew Glide|Phoenix Shift|Soulzone|Hammer Chance|Bananeira|Negativa)(\s*(cancel|f|b|u|d))?$/i;
const systemTokenPattern = /^(T!|S!|W!|WBl!|Heat Burst|Heat Smash|Rage Art|Starburst)$/i;
const movementTokenPattern = /^(dash|ff|microdash|sidestep|ssl|ssr|dash ssl|dash ssr)$/i;

export function framesToMs(frames: number, fps = defaultFps): number {
  return Math.round((frames * 1000) / fps);
}

export function estimateGapFrames(currentNote: ComboNote, nextNote: ComboNote): number {
  const currentLabel = currentNote.label.toLowerCase();
  const nextLabel = nextNote.label.toLowerCase();
  const combinedLabel = `${currentLabel} ${nextLabel}`;

  if (currentLabel.includes('t!') || currentLabel.includes('tornado')) return 38;
  if (/\b(dash|ff|microdash|wr)\b/i.test(combinedLabel)) return 34;
  if (/\b(ewgf|electric|just|pewgf)\b/i.test(combinedLabel)) return 18;
  if (stancePattern.test(combinedLabel)) return 30;
  if (/(1\+2|3\+4|1\+4|2\+3|2\+4)/.test(combinedLabel)) return 26;
  if (/^[1-4]$/.test(currentLabel) || /^[1-4]$/.test(nextLabel)) return 21;
  return 27;
}

function electricInputSequence(label: string): ComboNote['inputSequence'] | null {
  if (!/\b(EWGF|EWFG|EWHF|PEWGF|electric)\b/i.test(label)) return null;

  return [
    { directions: ['forward'], buttons: [], frameOffset: -3 },
    { directions: [], buttons: [], frameOffset: -2 },
    { directions: ['down'], buttons: [], frameOffset: -1 },
    { directions: ['down', 'forward'], buttons: ['2'], frameOffset: 0 },
  ];
}

function noteKind(label: string, note: ComboNote): ComboNote['kind'] {
  const trimmedLabel = label.trim();
  if (systemTokenPattern.test(trimmedLabel)) return 'system';
  if (movementTokenPattern.test(trimmedLabel)) return 'movement';
  if (stanceOnlyPattern.test(trimmedLabel) && note.buttons.length === 0) return 'stance';
  return 'attack';
}

function normalizeComboNote(note: ComboNote): ComboNote {
  const inputSequence = note.inputSequence ?? electricInputSequence(note.label);
  const kind = note.kind ?? noteKind(note.label, note);

  if (inputSequence) {
    return {
      ...note,
      kind,
      inputSequence,
      directions: inputSequence.at(-1)?.directions ?? note.directions,
      buttons: inputSequence.at(-1)?.buttons ?? note.buttons,
    };
  }

  return {
    ...note,
    kind,
  };
}

export function applyEstimatedTiming(combo: Combo): Combo {
  const fps = combo.timing?.fps ?? defaultFps;
  const startOffsetFrames = combo.timing?.startOffsetFrames ?? defaultStartOffsetFrames;
  const manualGapFrames = combo.timing?.manualGapFrames;
  let currentFrame = startOffsetFrames;

  // This is a playable estimate, not canonical Tekken frame data. Frame data does
  // not directly equal real combo input timing; precise timing should be calibrated
  // from 60fps video or training-mode capture. manualGapFrames exists for that.
  const notes = combo.notes.map((note, index) => {
    if (index > 0) {
      currentFrame += manualGapFrames?.[index - 1] ?? estimateGapFrames(combo.notes[index - 1], note);
    }

    return {
      ...normalizeComboNote(note),
      time: framesToMs(currentFrame, fps),
    };
  });

  return {
    ...combo,
    notes,
  };
}

export function prepareComboDatabase(database: ComboDatabase): ComboDatabase {
  return Object.fromEntries(
    Object.entries(database).map(([character, combos]) => {
      return [character, combos.map(applyEstimatedTiming)];
    }),
  );
}

export function validateComboTiming(combo: Combo): string[] {
  const errors: string[] = [];

  combo.notes.forEach((note, index) => {
    if (typeof note.time !== 'number' || Number.isNaN(note.time)) {
      errors.push(`${combo.id}: notes[${index}].time must be a number`);
    }

    if (index > 0 && note.time <= combo.notes[index - 1].time) {
      errors.push(`${combo.id}: notes[${index}].time must be greater than notes[${index - 1}].time`);
    }
  });

  const manualGapFrames = combo.timing?.manualGapFrames;
  if (manualGapFrames && manualGapFrames.length > 0 && manualGapFrames.length !== combo.notes.length - 1) {
    errors.push(`${combo.id}: timing.manualGapFrames must have ${combo.notes.length - 1} values`);
  }

  return errors;
}
