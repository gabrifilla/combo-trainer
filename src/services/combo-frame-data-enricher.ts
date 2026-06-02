import { fetchTekkenDocsMoves } from '@/services/tekkendocs-frame-data.service';
import type { ComboDatabase } from '@/services/combo-timing';
import type {
  ComboNoteFrameData,
  NoteFrameDataMatch,
  TekkenDocsMove,
} from '@/types/tekken-frame-data';

const contextPrefixPattern = /^(ch|fc|ws|bt|heat)[ .:+-]*/i;
const nonAttackPattern =
  /^(dash|ff|microdash|sidestep|ssl|ssr|t!|s!|w!|wbl!|tornado|heat|heatburst|heatsmash|rageart|starburst|dckcancel|stancecancel|bt|fc|ws)$/i;

export function normalizeTekkenCommand(command: string): string {
  return command
    .toLowerCase()
    .replace(/[\s]/g, '')
    .replace(/＞/g, '>')
    .replace(/\./g, '.')
    .replace(/d\/f/g, 'df')
    .replace(/d\/b/g, 'db')
    .replace(/u\/f/g, 'uf')
    .replace(/u\/b/g, 'ub')
    .replace(/while standing/g, 'ws')
    .replace(/while-running/g, 'wr')
    .replace(/while running/g, 'wr')
    .replace(/full crouch/g, 'fc')
    .replace(/counter hit/g, 'ch')
    .replace(/,/g, ',')
    .trim();
}

function removeContextPrefixes(command: string): string {
  let normalized = command;
  let previous = '';

  while (normalized !== previous) {
    previous = normalized;
    normalized = normalized.replace(contextPrefixPattern, '');
  }

  return normalized;
}

function firstSequenceToken(command: string): string {
  return command.split(/[>~]/)[0]?.trim() ?? command;
}

export function isNonAttackComboToken(label: string): boolean {
  return nonAttackPattern.test(normalizeTekkenCommand(label));
}

function baseMatch(status: NoteFrameDataMatch['status'], confidence: NoteFrameDataMatch['confidence'], label: string) {
  return {
    status,
    confidence,
    normalizedLabel: normalizeTekkenCommand(label),
  };
}

export function findBestMoveMatch(
  label: string,
  moves: TekkenDocsMove[],
): {
  move?: TekkenDocsMove;
  match: NoteFrameDataMatch;
} {
  const firstToken = firstSequenceToken(label);
  const normalizedLabel = normalizeTekkenCommand(firstToken);

  if (isNonAttackComboToken(firstToken)) {
    return { match: baseMatch('non-attack', 'none', firstToken) };
  }

  const exactMatch = moves.find((move) => move.command === firstToken);
  if (exactMatch) {
    return {
      move: exactMatch,
      match: {
        status: 'matched',
        confidence: 'exact',
        normalizedLabel,
        matchedCommand: exactMatch.command,
      },
    };
  }

  const normalizedMatch = moves.find((move) => normalizeTekkenCommand(move.command) === normalizedLabel);
  if (normalizedMatch) {
    return {
      move: normalizedMatch,
      match: {
        status: 'matched',
        confidence: 'normalized',
        normalizedLabel,
        matchedCommand: normalizedMatch.command,
      },
    };
  }

  const contextlessLabel = removeContextPrefixes(normalizedLabel);
  const contextlessMatch = moves.find((move) => normalizeTekkenCommand(move.command) === contextlessLabel);
  if (contextlessMatch) {
    return {
      move: contextlessMatch,
      match: {
        status: 'matched',
        confidence: 'normalized',
        normalizedLabel,
        matchedCommand: contextlessMatch.command,
      },
    };
  }

  const partialCandidates = moves.filter((move) => {
    const normalizedCommand = normalizeTekkenCommand(move.command);
    return normalizedCommand.includes(contextlessLabel) || contextlessLabel.includes(normalizedCommand);
  });

  if (partialCandidates.length === 1) {
    return {
      move: partialCandidates[0],
      match: {
        status: 'partial',
        confidence: 'partial',
        normalizedLabel,
        matchedCommand: partialCandidates[0].command,
        candidates: [partialCandidates[0].command],
      },
    };
  }

  if (partialCandidates.length > 1) {
    return {
      match: {
        status: 'ambiguous',
        confidence: 'partial',
        normalizedLabel,
        candidates: partialCandidates.map((candidate) => candidate.command),
      },
    };
  }

  return { match: baseMatch('not-found', 'none', firstToken) };
}

export function moveToComboFrameData(characterId: string, move: TekkenDocsMove): ComboNoteFrameData {
  return {
    command: move.command,
    name: move.name,
    hitLevel: move.hitLevel,
    damage: move.damage,
    startup: move.startup,
    block: move.block,
    hit: move.hit,
    counterHit: move.counterHit,
    notes: move.notes,
    tags: move.tags,
    transitions: move.transitions,
    wavuId: move.wavuId,
    recovery: move.recovery,
    source: `https://tekkendocs.com/t8/${characterId}/${encodeURIComponent(move.command)}`,
  };
}

export async function enrichComboDatabaseWithFrameData(comboDatabase: ComboDatabase): Promise<ComboDatabase> {
  const enrichedEntries = await Promise.all(
    Object.entries(comboDatabase).map(async ([characterId, combos]) => {
      let moves: TekkenDocsMove[] = [];

      try {
        moves = await fetchTekkenDocsMoves(characterId);
      } catch (error) {
        console.warn(`Failed to fetch TekkenDocs moves for ${characterId}:`, error);
      }

      return [
        characterId,
        combos.map((combo) => ({
          ...combo,
          notes: combo.notes.map((note) => {
            const { move, match } = findBestMoveMatch(note.label, moves);

            return {
              ...note,
              frameData: move ? moveToComboFrameData(characterId, move) : undefined,
              frameDataMatch: match,
            };
          }),
        })),
      ] as const;
    }),
  );

  return Object.fromEntries(enrichedEntries);
}
