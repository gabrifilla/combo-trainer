import type { ComboDefinition, Fighter } from '@/types/combo';

export const fighters: Fighter[] = [
  { id: 'fighter-a', name: 'Fighter A', archetype: 'Balanced starter', accent: '#2dd4bf' },
  { id: 'fighter-b', name: 'Fighter B', archetype: 'Pressure specialist', accent: '#f97316' },
  { id: 'fighter-c', name: 'Fighter C', archetype: 'Timing focused', accent: '#a3e635' },
];

export const combos: ComboDefinition[] = [
  {
    id: 'combo-basic-001',
    character: 'Fighter A',
    name: 'Combo basico',
    difficulty: 'beginner',
    scrollSpeed: 1,
    approachTime: 2000,
    hitWindow: { perfect: 80, great: 150, good: 250 },
    notes: [
      { id: 'a-1', label: 'df+2', time: 1000, directions: ['down', 'forward'], buttons: ['2'] },
      { id: 'a-2', label: '1', time: 1800, directions: [], buttons: ['1'] },
      { id: 'a-3', label: '2', time: 2100, directions: [], buttons: ['2'] },
      { id: 'a-4', label: '1', time: 2400, directions: [], buttons: ['1'] },
      { id: 'a-5', label: 'f+2', time: 3200, directions: ['forward'], buttons: ['2'] },
    ],
  },
  {
    id: 'combo-basic-002',
    character: 'Fighter A',
    name: 'Ritmo de jab',
    difficulty: 'beginner',
    scrollSpeed: 1,
    approachTime: 1800,
    hitWindow: { perfect: 80, great: 150, good: 250 },
    notes: [
      { id: 'jab-1', label: '1', time: 900, directions: [], buttons: ['1'] },
      { id: 'jab-2', label: '1', time: 1250, directions: [], buttons: ['1'] },
      { id: 'jab-3', label: '2', time: 1650, directions: [], buttons: ['2'] },
      { id: 'jab-4', label: 'f+2', time: 2300, directions: ['forward'], buttons: ['2'] },
      { id: 'jab-5', label: 'df+2', time: 3150, directions: ['down', 'forward'], buttons: ['2'] },
    ],
  },
  {
    id: 'combo-pressure-001',
    character: 'Fighter B',
    name: 'Pressao curta',
    difficulty: 'intermediate',
    scrollSpeed: 1.08,
    approachTime: 1700,
    hitWindow: { perfect: 80, great: 150, good: 250 },
    notes: [
      { id: 'b-1', label: 'f+2', time: 800, directions: ['forward'], buttons: ['2'] },
      { id: 'b-2', label: '1', time: 1250, directions: [], buttons: ['1'] },
      { id: 'b-3', label: '2', time: 1520, directions: [], buttons: ['2'] },
      { id: 'b-4', label: 'db+3', time: 2300, directions: ['down', 'back'], buttons: ['3'] },
      { id: 'b-5', label: '4', time: 2920, directions: [], buttons: ['4'] },
      { id: 'b-6', label: 'df+2', time: 3600, directions: ['down', 'forward'], buttons: ['2'] },
    ],
  },
  {
    id: 'combo-timing-001',
    character: 'Fighter C',
    name: 'Cadencia precisa',
    difficulty: 'advanced',
    scrollSpeed: 1.15,
    approachTime: 1600,
    hitWindow: { perfect: 80, great: 150, good: 250 },
    notes: [
      { id: 'c-1', label: 'df+2', time: 900, directions: ['down', 'forward'], buttons: ['2'] },
      { id: 'c-2', label: '1', time: 1550, directions: [], buttons: ['1'] },
      { id: 'c-3', label: '2', time: 1800, directions: [], buttons: ['2'] },
      { id: 'c-4', label: '1,2,1', time: 2300, directions: [], buttons: ['1'] },
      { id: 'c-5', label: '2', time: 2540, directions: [], buttons: ['2'] },
      { id: 'c-6', label: '1', time: 2780, directions: [], buttons: ['1'] },
      { id: 'c-7', label: 'f+2', time: 3500, directions: ['forward'], buttons: ['2'] },
    ],
  },
];

export function getCombosByCharacter(character: string) {
  return combos.filter((combo) => combo.character === character);
}

export function getComboById(comboId: string) {
  return combos.find((combo) => combo.id === comboId);
}
