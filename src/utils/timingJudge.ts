import type { HitWindow, JudgeResult } from '@/types/combo';

export function judgeTiming(deltaMs: number, window: HitWindow): JudgeResult | null {
  const absoluteDelta = Math.abs(deltaMs);

  if (absoluteDelta <= window.perfect) return 'Perfect';
  if (absoluteDelta <= window.great) return 'Great';
  if (absoluteDelta <= window.good) return 'Good';

  return null;
}
