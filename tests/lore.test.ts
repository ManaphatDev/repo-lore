import { describe, expect, it } from 'vitest';

import { analyzeRepo } from '@/features/analysis/engine';
import { generateAllLore, generateLore } from '@/features/lore/generator';
import { buildFacts, nameList } from '@/features/lore/facts';
import type { NarrativeMode } from '@/types/analysis';
import { makeBundle, makeContributor } from './fixtures';

const analysis = analyzeRepo(makeBundle());
const MODES: NarrativeMode[] = [
  'documentary',
  'fantasy',
  'scifi',
  'corporate',
  'meme',
  'noir',
  'news',
];

describe('generateAllLore', () => {
  const all = generateAllLore(analysis);

  it('produces all seven narrative voices', () => {
    expect(Object.keys(all).sort()).toEqual([...MODES].sort());
  });

  it.each(MODES)('renders a well-formed, cleaned story for %s', (mode) => {
    const lore = all[mode];
    expect(lore.mode).toBe(mode);
    expect(lore.title.trim()).toBe(lore.title);
    expect(lore.title.length).toBeGreaterThan(0);
    expect(lore.logline.length).toBeGreaterThan(0);
    expect(lore.chapters).toHaveLength(5);

    for (const chapter of lore.chapters) {
      expect(chapter.title.length).toBeGreaterThan(0);
      expect(chapter.paragraphs.length).toBeGreaterThanOrEqual(1);
      for (const p of chapter.paragraphs) {
        expect(p.length).toBeGreaterThan(0);
        expect(p).toBe(p.trim());
        expect(p).not.toMatch(/\s{2}/); // collapsed whitespace
        expect(p).not.toMatch(/\s[.,;:!?]/); // no space before punctuation
        expect(p).not.toContain('()'); // no empty parentheses
      }
    }
  });
});

describe('generateLore', () => {
  it('is deterministic for the same input', () => {
    expect(generateLore(analysis, 'fantasy')).toEqual(
      generateLore(analysis, 'fantasy'),
    );
  });

  it('returns the requested mode', () => {
    expect(generateLore(analysis, 'meme').mode).toBe('meme');
  });
});

describe('buildFacts', () => {
  it('distils analysis into narration-ready facts', () => {
    const f = buildFacts(analysis);
    expect(f.name).toBe('demo');
    expect(f.owner).toBe('octocat');
    expect(f.stars).toBe('1k');
    expect(f.starsRaw).toBe(1_000);
    expect(f.contributorsLabel).toBe('4');
    expect(f.busFactor).toBe(1);
    expect(Object.keys(f.scores).sort()).toEqual([
      'Community',
      'Documentation',
      'Growth',
      'Innovation',
      'Maintenance',
      'Stability',
      'Testing',
    ]);
  });

  it('marks a "+" suffix once contributors reach 100', () => {
    const big = analyzeRepo(
      makeBundle({
        contributors: Array.from({ length: 120 }, (_, i) =>
          makeContributor(`dev${i}`, 120 - i),
        ),
      }),
    );
    expect(buildFacts(big).contributorsLabel).toBe('120+');
  });
});

describe('nameList', () => {
  it('formats lists of one, two and three names', () => {
    expect(nameList(['alice'])).toBe('alice');
    expect(nameList(['alice', 'bob'])).toBe('alice and bob');
    expect(nameList(['alice', 'bob', 'carol'])).toBe('alice, bob and carol');
  });

  it('dedupes and drops nulls', () => {
    expect(nameList(['alice', null, 'alice', 'bob'])).toBe('alice and bob');
  });

  it('falls back when there are no names', () => {
    expect(nameList([null, null])).toBe('a handful of dedicated developers');
  });
});
