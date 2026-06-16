import { type NextRequest } from 'next/server';

import { runAnalysis } from '@/services/analyze';
import type { DnaCategory } from '@/types/analysis';

export const runtime = 'nodejs';
export const revalidate = 600;

const DNA_CATEGORIES: DnaCategory[] = [
  'Innovation',
  'Stability',
  'Community',
  'Growth',
  'Maintenance',
  'Documentation',
  'Testing',
];

const LABEL_BG = '#2a2118';

function scoreColor(n: number): string {
  if (n >= 70) return '#3a9e8a';
  if (n >= 45) return '#c79a3f';
  return '#c0533b';
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Rough Verdana-11 text width + horizontal padding for one badge segment. */
function segWidth(text: string): number {
  return Math.round(text.length * 6.5) + 16;
}

function renderBadge(label: string, message: string, color: string): string {
  const lw = segWidth(label);
  const mw = segWidth(message);
  const total = lw + mw;
  const lMid = lw / 2;
  const mMid = lw + mw / 2;
  const l = esc(label);
  const m = esc(message);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="20" role="img" aria-label="${l}: ${m}">
<title>${l}: ${m}</title>
<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
<clipPath id="r"><rect width="${total}" height="20" rx="3" fill="#fff"/></clipPath>
<g clip-path="url(#r)">
<rect width="${lw}" height="20" fill="${LABEL_BG}"/>
<rect x="${lw}" width="${mw}" height="20" fill="${color}"/>
<rect width="${total}" height="20" fill="url(#s)"/>
</g>
<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
<text x="${lMid}" y="15" fill="#010101" fill-opacity=".3">${l}</text>
<text x="${lMid}" y="14">${l}</text>
<text x="${mMid}" y="15" fill="#010101" fill-opacity=".3">${m}</text>
<text x="${mMid}" y="14">${m}</text>
</g>
</svg>`;
}

function svg(body: string): Response {
  return new Response(body, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=1200',
    },
  });
}

/**
 * GET /api/badge?repo=owner/repo[&label=...][&trait=Innovation]
 * Returns a shields-style SVG badge. Default shows the maturity stage + index;
 * with ?trait= it shows that DNA score. Always 200 so a README never shows a
 * broken image — failures render a neutral "unknown" badge.
 */
export async function GET(req: NextRequest) {
  const repo = req.nextUrl.searchParams.get('repo') ?? '';
  const customLabel = req.nextUrl.searchParams.get('label')?.trim();
  const traitParam = req.nextUrl.searchParams.get('trait')?.trim();
  const trait = DNA_CATEGORIES.find(
    (c) => c.toLowerCase() === traitParam?.toLowerCase(),
  );

  const result = await runAnalysis(repo);
  if (!result.ok) {
    return svg(renderBadge(customLabel || 'repo lore', 'unknown', '#777'));
  }

  const a = result.analysis;

  if (trait) {
    const score = a.dna.find((d) => d.category === trait)?.score ?? 0;
    return svg(
      renderBadge(customLabel || trait, `${score}/100`, scoreColor(score)),
    );
  }

  return svg(
    renderBadge(
      customLabel || 'repo lore',
      `${a.maturity.stage} ${a.maturity.index}`,
      scoreColor(a.maturity.index),
    ),
  );
}
