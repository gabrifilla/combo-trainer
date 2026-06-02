import type { TekkenDocsMove } from '@/types/tekken-frame-data';

const routeKeyPrefix = 'routes/_mainLayout.t8_';

function decodeReactRouterPayload(serializedPayload: string): unknown {
  const values = JSON.parse(serializedPayload) as unknown[];

  function decodeRef(index: number, seen = new Map<object, unknown>()): unknown {
    return decodeValue(values[index], seen);
  }

  function decodeValue(value: unknown, seen: Map<object, unknown>): unknown {
    if (Array.isArray(value)) {
      return value.map((entry) => decodeRef(entry as number, seen));
    }

    if (value && typeof value === 'object') {
      if (seen.has(value)) return seen.get(value);

      const output: Record<string, unknown> = {};
      seen.set(value, output);

      for (const [encodedKey, encodedValue] of Object.entries(value)) {
        const keyIndex = Number(encodedKey.replace(/^_/, ''));
        const key = values[keyIndex];

        if (typeof key === 'string') {
          output[key] = decodeRef(encodedValue as number, seen);
        }
      }

      return output;
    }

    return value;
  }

  return decodeRef(0);
}

function extractStreamPayload(html: string): string | null {
  const marker = '__reactRouterContext.streamController.enqueue(';
  const start = html.indexOf(marker);
  if (start === -1) return null;

  const argumentStart = start + marker.length;
  const argumentEnd = html.indexOf(');</script>', argumentStart);
  if (argumentEnd === -1) return null;

  return JSON.parse(html.slice(argumentStart, argumentEnd)) as string;
}

function extractMovesFromDecodedPayload(payload: unknown): TekkenDocsMove[] {
  const loaderData = (payload as { loaderData?: Record<string, unknown> }).loaderData;
  if (!loaderData) return [];

  const characterRoute = Object.entries(loaderData).find(([routeKey]) => routeKey.startsWith(routeKeyPrefix))?.[1] as
    | { moves?: unknown }
    | undefined;

  if (!Array.isArray(characterRoute?.moves)) return [];

  return characterRoute.moves.filter((move): move is TekkenDocsMove => {
    return Boolean(move && typeof move === 'object' && 'command' in move && 'moveNumber' in move);
  });
}

export async function fetchTekkenDocsMoves(characterId: string): Promise<TekkenDocsMove[]> {
  const response = await fetch(`https://tekkendocs.com/t8/${characterId}`);

  if (!response.ok) {
    throw new Error(`TekkenDocs returned ${response.status} for ${characterId}`);
  }

  const html = await response.text();
  const streamPayload = extractStreamPayload(html);
  if (!streamPayload) return [];

  const decodedPayload = decodeReactRouterPayload(streamPayload);
  return extractMovesFromDecodedPayload(decodedPayload);
}
