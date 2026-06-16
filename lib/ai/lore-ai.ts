import 'server-only';

import type { Lore, NarrativeMode } from '@/types/analysis';
import { MODES } from '@/features/lore/modes';

const BASE_URL = (
  process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'
).replace(/\/+$/, '');
const ENDPOINT = `${BASE_URL}/chat/completions`;
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

/**
 * AI prose is available if a key is set (cloud providers) OR a custom base URL
 * is set (e.g. a local Ollama server, which needs no key).
 */
export function isAiAvailable(): boolean {
  return Boolean(process.env.OPENAI_API_KEY || process.env.OPENAI_BASE_URL);
}

interface EnhanceResult {
  lore: Lore;
  enhanced: boolean;
  /** Why enhancement did not happen, when enhanced is false. */
  reason?:
    | 'no_api_key'
    | 'invalid_api_key'
    | 'rate_limited'
    | 'quota_exceeded'
    | 'http_error'
    | 'bad_response'
    | 'request_failed';
}

/**
 * Rewrite a deterministically-generated lore's prose in its narrative voice
 * using OpenAI. Strictly grounded: the model may only rephrase, never add
 * facts. On any failure (no key, network, bad JSON) the original lore is
 * returned unchanged, so callers always get a usable result.
 */
export async function enhanceLore(
  lore: Lore,
  mode: NarrativeMode,
  lang: 'en' | 'th' = 'en',
): Promise<EnhanceResult> {
  const key = process.env.OPENAI_API_KEY;
  const customBase = Boolean(process.env.OPENAI_BASE_URL);
  if (!key && !customBase) {
    return { lore, enhanced: false, reason: 'no_api_key' };
  }

  const voice = MODES[mode];
  const languageRule =
    lang === 'th'
      ? 'Write EVERYTHING — title, logline, every chapter title, subtitle and paragraph — in natural, fluent Thai (ภาษาไทย). Keep code identifiers, @usernames, version tags, URLs and numbers exactly as-is (do not transliterate them).'
      : 'Write in clear, natural English, and keep each chapter title and subtitle unchanged.';
  const system = [
    `You are a master prose stylist rewriting a software repository's "lore" in a specific voice: ${voice.meta.label} — ${voice.meta.blurb}.`,
    'Rewrite ONLY the wording so it reads more vividly and naturally in that voice.',
    languageRule,
    'HARD RULES:',
    '1. Do NOT invent or alter any facts: names, numbers, dates, versions, counts, scores, or events must stay exactly as given. If it is not in the source, it must not appear.',
    '2. Keep the same number of chapters and the same number of paragraphs per chapter, in the same order.',
    '3. Preserve *emphasis* markers (text wrapped in single asterisks) around the same key terms.',
    '4. Keep each paragraph close to its original length.',
    'Respond with a single JSON object of the shape: {"title": string, "logline": string, "chapters": [{"title": string, "subtitle": string, "paragraphs": string[]}, ...]}.',
  ].join('\n');

  const payload = {
    title: lore.title,
    logline: lore.logline,
    chapters: lore.chapters.map((c) => ({
      title: c.title,
      subtitle: c.subtitle,
      paragraphs: c.paragraphs,
    })),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (key) reqHeaders.Authorization = `Bearer ${key}`;

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.85,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: `Rewrite this lore as JSON:\n${JSON.stringify(payload)}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const reason =
        res.status === 401
          ? 'invalid_api_key'
          : res.status === 429
            ? 'rate_limited'
            : 'http_error';
      return { lore, enhanced: false, reason };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { lore, enhanced: false, reason: 'bad_response' };

    const parsed = JSON.parse(content) as {
      title?: unknown;
      logline?: unknown;
      chapters?: Array<{
        title?: unknown;
        subtitle?: unknown;
        paragraphs?: unknown;
      }>;
    };

    const translate = lang === 'th';
    const str = (v: unknown, fallback: string) =>
      typeof v === 'string' && v.trim() ? v : fallback;

    const merged: Lore = {
      ...lore,
      title: str(parsed.title, lore.title),
      logline: str(parsed.logline, lore.logline),
      chapters: lore.chapters.map((c, i) => {
        const inc = parsed.chapters?.[i];
        const incoming = inc?.paragraphs;
        const paragraphs =
          Array.isArray(incoming) &&
          incoming.length > 0 &&
          incoming.every((p) => typeof p === 'string')
            ? (incoming as string[])
            : c.paragraphs;
        return {
          ...c,
          // Only translate chapter titles/subtitles for Thai; keep them stable in English.
          title: translate ? str(inc?.title, c.title) : c.title,
          subtitle: translate ? str(inc?.subtitle, c.subtitle) : c.subtitle,
          paragraphs,
        };
      }),
    };

    return { lore: merged, enhanced: true };
  } catch {
    return { lore, enhanced: false, reason: 'request_failed' };
  } finally {
    clearTimeout(timeout);
  }
}
