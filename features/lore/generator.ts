import type { Lore, NarrativeMode, RepoAnalysis } from '@/types/analysis';
import { buildFacts } from './facts';
import { MODES } from './modes';

function clean(p: string): string {
  return p
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/\(\s*\)/g, '')
    .trim();
}

/** Generate the lore for a single narrative mode. Pure + isomorphic. */
export function generateLore(
  analysis: RepoAnalysis,
  mode: NarrativeMode,
): Lore {
  const facts = buildFacts(analysis);
  const voice = MODES[mode];

  return {
    mode,
    title: clean(voice.title(facts)),
    logline: clean(voice.logline(facts)),
    chapters: voice.chapters(facts).map((c) => ({
      ...c,
      paragraphs: c.paragraphs.map(clean).filter((p) => p.length > 0),
    })),
  };
}

/** Generate lore for every mode at once (used to power instant switching). */
export function generateAllLore(
  analysis: RepoAnalysis,
): Record<NarrativeMode, Lore> {
  return {
    documentary: generateLore(analysis, 'documentary'),
    fantasy: generateLore(analysis, 'fantasy'),
    scifi: generateLore(analysis, 'scifi'),
    corporate: generateLore(analysis, 'corporate'),
    meme: generateLore(analysis, 'meme'),
    noir: generateLore(analysis, 'noir'),
    news: generateLore(analysis, 'news'),
  };
}
