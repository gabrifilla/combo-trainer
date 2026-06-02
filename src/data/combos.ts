import type { ComboDefinition, Fighter } from '@/types/combo';
import characterCombos from '@/data/characterCombos.json';

export const fighters: Fighter[] = [
  { id: 'kazuya', name: 'Kazuya', archetype: 'Mishima power', accent: '#ef4444' },
  { id: 'jin', name: 'Jin', archetype: 'Balanced Mishima', accent: '#38bdf8' },
  { id: 'king', name: 'King', archetype: 'Grappler', accent: '#f59e0b' },
  { id: 'jun', name: 'Jun', archetype: 'Kazama style', accent: '#a7f3d0' },
  { id: 'paul', name: 'Paul', archetype: 'Heavy striker', accent: '#f97316' },
  { id: 'law', name: 'Law', archetype: 'Rushdown', accent: '#fde047' },
  { id: 'jack-8', name: 'Jack-8', archetype: 'Power robot', accent: '#94a3b8' },
  { id: 'lars', name: 'Lars', archetype: 'Mobile offense', accent: '#60a5fa' },
  { id: 'xiaoyu', name: 'Xiaoyu', archetype: 'Evasive stance', accent: '#f9a8d4' },
  { id: 'nina', name: 'Nina', archetype: 'Assassin pressure', accent: '#c4b5fd' },
  { id: 'leroy', name: 'Leroy', archetype: 'Wing Chun', accent: '#eab308' },
  { id: 'asuka', name: 'Asuka', archetype: 'Defensive counter', accent: '#22c55e' },
  { id: 'lili', name: 'Lili', archetype: 'Elegant movement', accent: '#f0abfc' },
  { id: 'bryan', name: 'Bryan', archetype: 'Counter-hit pressure', accent: '#fb7185' },
  { id: 'hwoarang', name: 'Hwoarang', archetype: 'Kick pressure', accent: '#f97316' },
  { id: 'claudio', name: 'Claudio', archetype: 'Starburst control', accent: '#818cf8' },
  { id: 'azucena', name: 'Azucena', archetype: 'Coffee queen', accent: '#d97706' },
  { id: 'raven', name: 'Raven', archetype: 'Ninjutsu mixups', accent: '#7c3aed' },
  { id: 'leo', name: 'Leo', archetype: 'Versatile stance', accent: '#38bdf8' },
  { id: 'steve', name: 'Steve', archetype: 'Boxing specialist', accent: '#f43f5e' },
  { id: 'kuma', name: 'Kuma', archetype: 'Bear power', accent: '#a16207' },
  { id: 'yoshimitsu', name: 'Yoshimitsu', archetype: 'Tricky swordplay', accent: '#22d3ee' },
  { id: 'shaheen', name: 'Shaheen', archetype: 'Slide pressure', accent: '#fbbf24' },
  { id: 'dragunov', name: 'Dragunov', archetype: 'Relentless offense', accent: '#64748b' },
  { id: 'feng', name: 'Feng', archetype: 'Kenpo pressure', accent: '#dc2626' },
  { id: 'panda', name: 'Panda', archetype: 'Bear stance', accent: '#f8fafc' },
  { id: 'lee', name: 'Lee', archetype: 'Excellent timing', accent: '#60a5fa' },
  { id: 'alisa', name: 'Alisa', archetype: 'Android movement', accent: '#fb7185' },
  { id: 'zafina', name: 'Zafina', archetype: 'Unorthodox stances', accent: '#a78bfa' },
  { id: 'devil-jin', name: 'Devil Jin', archetype: 'Devil Mishima', accent: '#8b5cf6' },
  { id: 'victor', name: 'Victor', archetype: 'Super spy CQB', accent: '#93c5fd' },
  { id: 'reina', name: 'Reina', archetype: 'Aggressive Mishima', accent: '#c084fc' },
  { id: 'eddy', name: 'Eddy', archetype: 'Capoeira', accent: '#22c55e' },
  { id: 'lidia', name: 'Lidia', archetype: 'Karate prime minister', accent: '#ef4444' },
  { id: 'heihachi', name: 'Heihachi', archetype: 'Mishima legend', accent: '#facc15' },
  { id: 'clive', name: 'Clive', archetype: 'Guest swordfighter', accent: '#e879f9' },
  { id: 'anna', name: 'Anna', archetype: 'Assassin mixups', accent: '#f472b6' },
  { id: 'fahkumram', name: 'Fahkumram', archetype: 'Muay Thai power', accent: '#fb923c' },
  { id: 'armor-king', name: 'Armor King', archetype: 'Dark grappler', accent: '#a855f7' },
  { id: 'miary-zo', name: 'Miary Zo', archetype: 'Morengy fighter', accent: '#34d399' },
  { id: 'kunimitsu', name: 'Kunimitsu', archetype: 'Ninja thief', accent: '#f87171' },
];

const combosByFighterId = characterCombos as Record<string, Omit<ComboDefinition, 'character'>[]>;

export const combos: ComboDefinition[] = fighters.flatMap((fighter) => {
  return (combosByFighterId[fighter.id] ?? []).map((combo) => ({
    ...combo,
    character: fighter.name,
  }));
});

export function getCombosByCharacter(character: string) {
  return combos.filter((combo) => combo.character === character);
}

export function getComboById(comboId: string) {
  return combos.find((combo) => combo.id === comboId);
}
