import 'server-only';

import type { RepoAnalysis } from '@/types/analysis';

const BASE_URL = (
  process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'
).replace(/\/+$/, '');
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

/** Translate a batch of English strings to Thai in one call. Null on failure. */
async function translateBatch(strings: string[]): Promise<string[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key && !process.env.OPENAI_BASE_URL) return null;
  if (strings.length === 0) return strings;

  const system = [
    'You are a professional English→Thai translator for software/developer content.',
    'Translate each string into natural, fluent Thai.',
    'HARD RULES: keep numbers, percentages, dates, GitHub usernames, code identifiers, programming-language names, and version tags exactly as-is. Preserve *emphasis* markers (text wrapped in single asterisks) around the same words. Do not add, drop, or change any facts.',
    'GLOSSARY: keep these software-engineering terms as plain English words — Bus factor, commit, fork, star, pull request, issue, CI. Do NOT translate them literally and do NOT wrap them in asterisks or any markdown. For example "Bus factor" must stay "Bus factor" (never "ปัจจัยรถโดยสาร"), and "commit" must stay "commit" (never "*commit*").',
    'TERMS: translate "contributor"/"contributors" consistently as "ผู้พัฒนา".',
    'The user message is a JSON array of strings. Respond with a JSON object {"items": string[]} whose array has the SAME length and order as the input.',
  ].join('\n');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key) headers.Authorization = `Bearer ${key}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: JSON.stringify(strings) },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as { items?: unknown };
    const items = parsed.items;
    if (
      Array.isArray(items) &&
      items.length === strings.length &&
      items.every((s) => typeof s === 'string')
    ) {
      return items as string[];
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Return a copy of the analysis with its free-text fields translated to the
 * target language. Labels (category/role/stage names) are translated in the UI
 * via the dictionary, so only the generated sentences are sent here. Falls back
 * to the original (English) analysis on any failure.
 */
export async function localizeAnalysis(
  analysis: RepoAnalysis,
  lang: 'en' | 'th',
): Promise<RepoAnalysis> {
  if (lang !== 'th') return analysis;

  const strings: string[] = [];
  analysis.dna.forEach((d) => strings.push(d.explanation));
  strings.push(analysis.maturity.summary);
  analysis.timeline.forEach((e) => {
    strings.push(e.title);
    strings.push(e.description);
  });
  analysis.contributors.forEach((c) => strings.push(c.rationale));
  analysis.insights.forEach((i) => {
    strings.push(i.title);
    strings.push(i.detail);
  });

  const out = await translateBatch(strings);
  if (!out) return analysis;

  let k = 0;
  const dna = analysis.dna.map((d) => ({ ...d, explanation: out[k++]! }));
  const maturity = { ...analysis.maturity, summary: out[k++]! };
  const timeline = analysis.timeline.map((e) => ({
    ...e,
    title: out[k++]!,
    description: out[k++]!,
  }));
  const contributors = analysis.contributors.map((c) => ({
    ...c,
    rationale: out[k++]!,
  }));
  const insights = analysis.insights.map((i) => ({
    ...i,
    title: out[k++]!,
    detail: out[k++]!,
  }));

  return { ...analysis, dna, maturity, timeline, contributors, insights };
}
