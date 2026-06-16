import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';

import { runAnalysis } from '@/services/analyze';
import { generateLore } from '@/features/lore/generator';
import { formatNumber } from '@/lib/format';
import type { RepoAnalysis } from '@/types/analysis';

export const runtime = 'nodejs';

const SIZE = { width: 1200, height: 630 };

const COLOR = {
  bg: '#15110c',
  text: '#efe6d3',
  muted: '#a89a82',
  border: 'rgba(212,162,76,0.22)',
  gold: '#d4a24c',
  verdigris: '#4ba892',
  oxblood: '#c0533b',
  track: 'rgba(143,134,122,0.18)',
};

/**
 * Render an element to a PNG response, falling back to the generic card if
 * satori throws — a social crawler must never receive a 500.
 */
async function png(element: React.ReactElement): Promise<Response> {
  try {
    const img = new ImageResponse(element, SIZE);
    const buf = await img.arrayBuffer();
    return new Response(buf, {
      headers: {
        'content-type': 'image/png',
        'cache-control': 'public, max-age=600, s-maxage=600',
      },
    });
  } catch {
    return new ImageResponse(<FallbackCard />, SIZE);
  }
}

/**
 * GET /api/og?repo=owner/repo[&vs=owner/repo]
 * Renders a 1200×630 social card. With ?vs= it renders a head-to-head battle card.
 * Stateless — computed live from the analysis pipeline.
 */
export async function GET(req: NextRequest) {
  const repo = req.nextUrl.searchParams.get('repo') ?? '';
  const vs = req.nextUrl.searchParams.get('vs') ?? '';

  if (vs.trim()) {
    const [a, b] = await Promise.all([runAnalysis(repo), runAnalysis(vs)]);
    if (a.ok && b.ok) return png(<BattleCard a={a.analysis} b={b.analysis} />);
    return png(<FallbackCard />);
  }

  const result = await runAnalysis(repo);
  if (!result.ok) return png(<FallbackCard />);
  return png(<RepoCard analysis={result.analysis} />);
}

function Eyebrow({ children }: { children: string }) {
  return (
    <div
      style={{
        display: 'flex',
        fontSize: 22,
        letterSpacing: 4,
        textTransform: 'uppercase',
        color: COLOR.gold,
      }}
    >
      {children}
    </div>
  );
}

function barTone(score: number): string {
  if (score >= 70) return COLOR.verdigris;
  if (score >= 45) return COLOR.gold;
  return COLOR.oxblood;
}

function DnaBars({ analysis }: { analysis: RepoAnalysis }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 420, gap: 14 }}>
      {analysis.dna.map((d) => (
        <div key={d.category} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 18,
              color: COLOR.muted,
            }}
          >
            <span>{d.category}</span>
            <span style={{ color: COLOR.text }}>{d.score}</span>
          </div>
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: 8,
              borderRadius: 8,
              background: COLOR.track,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: `${d.score}%`,
                height: 8,
                borderRadius: 8,
                background: barTone(d.score),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ display: 'flex', fontSize: 38, fontWeight: 600, color: COLOR.text }}>
        {value}
      </span>
      <span
        style={{
          display: 'flex',
          fontSize: 16,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: COLOR.muted,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: 60,
        justifyContent: 'space-between',
        backgroundColor: COLOR.bg,
        backgroundImage:
          'radial-gradient(circle at 82% 0%, rgba(212,162,76,0.14), transparent 55%)',
        color: COLOR.text,
        fontFamily: 'sans-serif',
      }}
    >
      {children}
    </div>
  );
}

function Chip({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        padding: '4px 14px',
        borderRadius: 999,
        border: `1px solid ${accent ? 'rgba(212,162,76,0.4)' : COLOR.border}`,
        fontSize: 18,
        color: accent ? COLOR.gold : COLOR.muted,
      }}
    >
      {label}
    </div>
  );
}

function ContributorStack({ analysis }: { analysis: RepoAnalysis }) {
  const top = [...analysis.contributors]
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, 5);
  if (top.length === 0) return null;
  const extra = analysis.stats.totalContributors - top.length;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex' }}>
        {top.map((c, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={c.login}
            src={c.avatar}
            alt=""
            width={46}
            height={46}
            style={{
              borderRadius: 999,
              border: `2px solid ${COLOR.bg}`,
              marginLeft: i === 0 ? 0 : -14,
            }}
          />
        ))}
      </div>
      <span style={{ display: 'flex', fontSize: 18, color: COLOR.muted }}>
        {extra > 0 ? `+${formatNumber(extra)} more` : 'the cast'}
      </span>
    </div>
  );
}

function RepoCard({ analysis }: { analysis: RepoAnalysis }) {
  const { identity: id, stats, maturity } = analysis;
  const logline = generateLore(analysis, 'documentary').logline;
  const tagline =
    logline.length > 150 ? `${logline.slice(0, 150).trimEnd()}…` : logline;
  const langs = analysis.charts.languageDistribution
    .filter((l) => l.name !== 'Other')
    .slice(0, 3)
    .map((l) => l.name);
  const topics = id.topics.slice(0, 3);

  return (
    <Shell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Eyebrow>Repository Lore</Eyebrow>
        <div
          style={{
            display: 'flex',
            padding: '8px 18px',
            borderRadius: 999,
            border: `1px solid ${COLOR.border}`,
            fontSize: 20,
            color: COLOR.gold,
          }}
        >
          {maturity.stage} · {maturity.index}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 44, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={id.ownerAvatar}
              alt=""
              width={84}
              height={84}
              style={{ borderRadius: 999, border: `1px solid ${COLOR.border}` }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ display: 'flex', fontSize: 28, color: COLOR.muted }}>
                {id.owner}/
              </span>
              <span style={{ display: 'flex', fontSize: 56, fontWeight: 700, lineHeight: 1.05 }}>
                {id.name}
              </span>
            </div>
          </div>

          {tagline && (
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                fontStyle: 'italic',
                color: 'rgba(239,230,211,0.92)',
                lineHeight: 1.4,
              }}
            >
              “{tagline}”
            </div>
          )}

          {(langs.length > 0 || topics.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {langs.map((l) => (
                <Chip key={`l-${l}`} label={l} accent />
              ))}
              {topics.map((tp) => (
                <Chip key={`t-${tp}`} label={`#${tp}`} />
              ))}
            </div>
          )}

          <ContributorStack analysis={analysis} />

          <div style={{ display: 'flex', gap: 40, marginTop: 4 }}>
            <Stat label="Stars" value={formatNumber(id.stars)} />
            <Stat label="Forks" value={formatNumber(id.forks)} />
            <Stat
              label="Contributors"
              value={`${formatNumber(stats.totalContributors)}${stats.totalContributors >= 100 ? '+' : ''}`}
            />
            <Stat label="Releases" value={formatNumber(stats.totalReleases)} />
          </div>
        </div>

        <DnaBars analysis={analysis} />
      </div>

      <div style={{ display: 'flex', fontSize: 18, color: COLOR.muted, letterSpacing: 1 }}>
        repository-lore · the chronicle engine for open source
      </div>
    </Shell>
  );
}

function dnaWins(a: RepoAnalysis, b: RepoAnalysis): [number, number] {
  let aw = 0;
  let bw = 0;
  for (const da of a.dna) {
    const db = b.dna.find((d) => d.category === da.category);
    if (!db) continue;
    if (da.score > db.score) aw++;
    else if (db.score > da.score) bw++;
  }
  return [aw, bw];
}

function BattleSide({
  analysis,
  wins,
  champion,
  align,
}: {
  analysis: RepoAnalysis;
  wins: number;
  champion: boolean;
  align: 'flex-start' | 'flex-end';
}) {
  const { identity: id } = analysis;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        alignItems: align,
        gap: 18,
        textAlign: align === 'flex-end' ? 'right' : 'left',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={id.ownerAvatar}
        alt=""
        width={110}
        height={110}
        style={{
          borderRadius: 999,
          border: `3px solid ${champion ? COLOR.gold : COLOR.border}`,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: align }}>
        <span style={{ display: 'flex', fontSize: 24, color: COLOR.muted }}>{id.owner}/</span>
        <span style={{ display: 'flex', fontSize: 48, fontWeight: 700, lineHeight: 1.05 }}>
          {id.name}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 22,
          color: champion ? COLOR.gold : COLOR.muted,
        }}
      >
        {wins}/7 DNA traits · {formatNumber(id.stars)} stars
      </div>
    </div>
  );
}

function BattleCard({ a, b }: { a: RepoAnalysis; b: RepoAnalysis }) {
  const [aw, bw] = dnaWins(a, b);
  return (
    <Shell>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Eyebrow>Repo Battle</Eyebrow>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <BattleSide analysis={a} wins={aw} champion={aw > bw} align="flex-end" />
        <div
          style={{
            display: 'flex',
            fontSize: 56,
            fontWeight: 700,
            color: COLOR.oxblood,
            padding: '0 8px',
          }}
        >
          VS
        </div>
        <BattleSide analysis={b} wins={bw} champion={bw > aw} align="flex-start" />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          fontSize: 18,
          color: COLOR.muted,
          letterSpacing: 1,
        }}
      >
        repository-lore · two repositories, one arena
      </div>
    </Shell>
  );
}

function FallbackCard() {
  return (
    <Shell>
      <Eyebrow>Repository Lore</Eyebrow>
      <div style={{ display: 'flex', fontSize: 56, fontWeight: 700 }}>
        Turn GitHub repositories into stories
      </div>
      <div style={{ display: 'flex', fontSize: 22, color: COLOR.muted }}>
        repository-lore · the chronicle engine for open source
      </div>
    </Shell>
  );
}
