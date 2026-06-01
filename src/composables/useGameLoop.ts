import { onBeforeUnmount } from 'vue';

export function useGameLoop(onFrame: (now: number) => void) {
  let frameId = 0;
  let active = false;

  const frame = (now: number) => {
    if (!active) return;
    onFrame(now);
    frameId = requestAnimationFrame(frame);
  };

  const start = () => {
    if (active) return;
    active = true;
    frameId = requestAnimationFrame(frame);
  };

  const stop = () => {
    active = false;
    cancelAnimationFrame(frameId);
  };

  onBeforeUnmount(stop);

  return { start, stop };
}
