export type FrameDataMatchStatus = 'matched' | 'partial' | 'not-found' | 'non-attack' | 'ambiguous';

export type FrameDataMatchConfidence = 'exact' | 'normalized' | 'partial' | 'none';

export interface TekkenDocsMove {
  moveNumber: number;
  command: string;
  name?: string;
  hitLevel: string;
  damage: string;
  startup: string;
  block: string;
  hit: string;
  counterHit: string;
  notes: string;
  tags?: Record<string, string>;
  transitions?: string[];
  wavuId?: string;
  ytVideo?: {
    id: string;
    start?: string;
    end?: string;
  };
  image?: string;
  video?: string;
  recovery?: string;
}

export interface NoteFrameDataMatch {
  status: FrameDataMatchStatus;
  confidence: FrameDataMatchConfidence;
  normalizedLabel: string;
  matchedCommand?: string;
  candidates?: string[];
}

export interface ComboNoteFrameData {
  command: string;
  name?: string;
  hitLevel: string;
  damage: string;
  startup: string;
  block: string;
  hit: string;
  counterHit: string;
  notes: string;
  tags?: Record<string, string>;
  transitions?: string[];
  wavuId?: string;
  recovery?: string;
  source: string;
}

export interface EnrichedComboNote {
  id: string;
  label: string;
  time: number;
  directions: string[];
  buttons: string[];
  frameData?: ComboNoteFrameData;
  frameDataMatch: NoteFrameDataMatch;
}
