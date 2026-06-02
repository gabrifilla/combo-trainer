import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { enrichComboDatabaseWithFrameData } from '../src/services/combo-frame-data-enricher';
import type { ComboDatabase } from '../src/services/combo-timing';
import type { FrameDataMatchStatus } from '../src/types/tekken-frame-data';

interface CharacterReport {
  totalNotes: number;
  matched: number;
  partial: number;
  ambiguous: number;
  nonAttack: number;
  notFound: number;
}

interface FrameDataReport extends CharacterReport {
  totalCharacters: number;
  totalCombos: number;
  byCharacter: Record<string, CharacterReport>;
  unresolved: Array<{
    characterId: string;
    comboId: string;
    noteId: string;
    label: string;
    status: string;
    candidates?: string[];
  }>;
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = path.join(rootDir, 'src/data/tekken8-combos-com-timing.json');
const fallbackInputPath = path.join(rootDir, 'src/data/characterCombos.json');
const outputPath = path.join(rootDir, 'src/data/tekken8-combos-com-frame-data.json');
const reportPath = path.join(rootDir, 'src/data/tekken8-combos-frame-data-report.json');

function emptyCharacterReport(): CharacterReport {
  return {
    totalNotes: 0,
    matched: 0,
    partial: 0,
    ambiguous: 0,
    nonAttack: 0,
    notFound: 0,
  };
}

async function readInputDatabase(): Promise<ComboDatabase> {
  const selectedInputPath = await fs
    .access(inputPath)
    .then(() => inputPath)
    .catch(() => fallbackInputPath);

  const raw = await fs.readFile(selectedInputPath, 'utf-8');
  return JSON.parse(raw) as ComboDatabase;
}

function incrementStatus(report: CharacterReport, status: FrameDataMatchStatus) {
  if (status === 'matched') report.matched += 1;
  if (status === 'partial') report.partial += 1;
  if (status === 'ambiguous') report.ambiguous += 1;
  if (status === 'non-attack') report.nonAttack += 1;
  if (status === 'not-found') report.notFound += 1;
}

function buildReport(database: ComboDatabase): FrameDataReport {
  const report: FrameDataReport = {
    ...emptyCharacterReport(),
    totalCharacters: Object.keys(database).length,
    totalCombos: 0,
    byCharacter: {},
    unresolved: [],
  };

  for (const [characterId, combos] of Object.entries(database)) {
    const characterReport = emptyCharacterReport();
    report.totalCombos += combos.length;

    for (const combo of combos) {
      for (const note of combo.notes) {
        const status = note.frameDataMatch?.status ?? 'not-found';
        characterReport.totalNotes += 1;
        report.totalNotes += 1;
        incrementStatus(characterReport, status);
        incrementStatus(report, status);

        if (status === 'not-found' || status === 'ambiguous') {
          report.unresolved.push({
            characterId,
            comboId: combo.id,
            noteId: note.id,
            label: note.label,
            status,
            candidates: note.frameDataMatch?.candidates,
          });
        }
      }
    }

    report.byCharacter[characterId] = characterReport;
  }

  return report;
}

const database = await readInputDatabase();
const enrichedDatabase = await enrichComboDatabaseWithFrameData(database);
const report = buildReport(enrichedDatabase);

await fs.writeFile(outputPath, `${JSON.stringify(enrichedDatabase, null, 2)}\n`);
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(`Matched: ${report.matched + report.partial}`);
console.log(`Not found: ${report.notFound}`);
console.log(`Ambiguous: ${report.ambiguous}`);
console.log('Manual review labels:');
for (const unresolved of report.unresolved) {
  console.log(`- ${unresolved.characterId}/${unresolved.comboId}/${unresolved.noteId}: ${unresolved.label} (${unresolved.status})`);
}
