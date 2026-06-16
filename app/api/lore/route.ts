import { NextResponse, type NextRequest } from 'next/server';

import type { NarrativeMode } from '@/types/analysis';
import { runAnalysis } from '@/services/analyze';
import { generateLore } from '@/features/lore/generator';
import { MODES } from '@/features/lore/modes';
import { enhanceLore } from '@/lib/ai/lore-ai';

export const runtime = 'nodejs';

function isMode(value: unknown): value is NarrativeMode {
  return typeof value === 'string' && value in MODES;
}

/**
 * POST /api/lore
 * Body: { repo: string, mode: NarrativeMode }
 * Returns an AI-enhanced lore for the given mode (or the deterministic one
 * if no OPENAI_API_KEY is configured / enhancement fails).
 */
export async function POST(req: NextRequest) {
  let body: { repo?: string; mode?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  const repo = (body.repo ?? '').trim();
  if (!repo || !isMode(body.mode)) {
    return NextResponse.json(
      { ok: false, message: 'Provide { repo, mode }.' },
      { status: 400 },
    );
  }

  const lang = body.lang === 'th' ? 'th' : 'en';

  const result = await runAnalysis(repo);
  if (!result.ok) {
    return NextResponse.json(result, { status: result.status });
  }

  const base = generateLore(result.analysis, body.mode);
  const { lore, enhanced, reason } = await enhanceLore(base, body.mode, lang);

  return NextResponse.json({ ok: true, lore, enhanced, reason, lang });
}
