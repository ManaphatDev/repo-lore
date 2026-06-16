'use client';

import Link from 'next/link';
import { Crown, ExternalLink } from 'lucide-react';

import type { RepoAnalysis } from '@/types/analysis';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { useT } from '@/components/i18n/language-provider';
import { SectionHeading } from './section-heading';
import { BattleRadar } from './charts/battle-radar';

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

function Fighter({
  analysis,
  champion,
  align,
}: {
  analysis: RepoAnalysis;
  champion: boolean;
  align: 'left' | 'right';
}) {
  const t = useT();
  const { identity: id, maturity } = analysis;
  return (
    <div
      className={cn(
        'flex flex-1 items-center gap-4',
        align === 'right' && 'flex-row-reverse text-right',
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={id.ownerAvatar}
        alt={`${id.owner} avatar`}
        width={56}
        height={56}
        className={cn(
          'h-14 w-14 shrink-0 rounded-full border',
          champion ? 'border-gold' : 'border-border',
        )}
        referrerPolicy="no-referrer"
      />
      <div className={cn('min-w-0', align === 'right' && 'flex flex-col items-end')}>
        <a
          href={id.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-display text-xl font-semibold tracking-tight hover:text-gold"
        >
          {champion && <Crown className="h-4 w-4 text-gold" />}
          <span className="truncate">
            <span className="text-muted-foreground">{id.owner}/</span>
            {id.name}
          </span>
          <ExternalLink className="h-3.5 w-3.5 opacity-50" />
        </a>
        <div className="mt-1.5">
          <Badge variant={champion ? 'default' : 'secondary'}>
            {t.maturity[maturity.stage]}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function TraitRow({
  label,
  a,
  b,
}: {
  label: string;
  a: number;
  b: number;
}) {
  const aWin = a > b;
  const bWin = b > a;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'w-9 shrink-0 text-right font-mono text-sm tabular-nums',
            aWin ? 'text-gold' : 'text-muted-foreground',
          )}
        >
          {a}
        </span>
        <div className="flex h-1.5 flex-1 justify-end rounded-full bg-muted">
          <div
            className={cn('h-1.5 rounded-full', aWin ? 'bg-gold' : 'bg-muted-foreground/40')}
            style={{ width: `${a}%` }}
          />
        </div>
      </div>
      <span className="w-28 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <div className="flex h-1.5 flex-1 rounded-full bg-muted">
          <div
            className={cn('h-1.5 rounded-full', bWin ? 'bg-verdigris' : 'bg-muted-foreground/40')}
            style={{ width: `${b}%` }}
          />
        </div>
        <span
          className={cn(
            'w-9 shrink-0 font-mono text-sm tabular-nums',
            bWin ? 'text-verdigris' : 'text-muted-foreground',
          )}
        >
          {b}
        </span>
      </div>
    </div>
  );
}

function StatRow({
  label,
  a,
  b,
}: {
  label: string;
  a: number;
  b: number;
}) {
  const aWin = a > b;
  const bWin = b > a;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3">
      <span
        className={cn(
          'text-right font-display text-lg font-semibold tabular-nums',
          aWin ? 'text-gold' : 'text-foreground',
        )}
      >
        {formatNumber(a)}
      </span>
      <span className="w-28 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'font-display text-lg font-semibold tabular-nums',
          bWin ? 'text-verdigris' : 'text-foreground',
        )}
      >
        {formatNumber(b)}
      </span>
    </div>
  );
}

export function Battle({ a, b }: { a: RepoAnalysis; b: RepoAnalysis }) {
  const t = useT();
  const [aw, bw] = dnaWins(a, b);
  const aChampion = aw > bw;
  const bChampion = bw > aw;

  const stats: Array<{ label: string; a: number; b: number }> = [
    { label: t.battle.stats.stars, a: a.identity.stars, b: b.identity.stars },
    { label: t.battle.stats.forks, a: a.identity.forks, b: b.identity.forks },
    {
      label: t.battle.stats.contributors,
      a: a.stats.totalContributors,
      b: b.stats.totalContributors,
    },
    {
      label: t.battle.stats.commitsPerWeek,
      a: a.stats.commitsPerWeek,
      b: b.stats.commitsPerWeek,
    },
    {
      label: t.battle.stats.releases,
      a: a.stats.totalReleases,
      b: b.stats.totalReleases,
    },
    {
      label: t.battle.stats.maturity,
      a: a.maturity.index,
      b: b.maturity.index,
    },
    { label: t.battle.stats.age, a: a.identity.ageDays, b: b.identity.ageDays },
  ];

  return (
    <div className="space-y-12">
      <SectionHeading eyebrow={t.battle.eyebrow} title={t.battle.title} />

      {/* Arena header */}
      <section className="rounded-2xl border border-border bg-card/60 p-6 shadow-codex">
        <div className="flex items-center gap-4">
          <Fighter analysis={a} champion={aChampion} align="left" />
          <span className="shrink-0 font-display text-2xl font-bold text-oxblood">
            {t.battle.vs}
          </span>
          <Fighter analysis={b} champion={bChampion} align="right" />
        </div>
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-t border-border/60 pt-4 font-mono text-xs">
          <span className={cn('text-right', aChampion ? 'text-gold' : 'text-muted-foreground')}>
            {t.battle.traitWins.replace('{n}', String(aw))}
          </span>
          <span className="w-28 text-center uppercase tracking-wider text-muted-foreground">
            {aw === bw ? t.battle.draw : t.battle.winner}
          </span>
          <span className={cn(bChampion ? 'text-verdigris' : 'text-muted-foreground')}>
            {t.battle.traitWins.replace('{n}', String(bw))}
          </span>
        </div>
      </section>

      {/* DNA radar */}
      <section className="rounded-2xl border border-border bg-card/60 p-6">
        <span className="eyebrow">{t.battle.radarTitle}</span>
        <div className="mt-2">
          <BattleRadar
            a={a.dna}
            b={b.dna}
            aLabel={a.identity.name}
            bLabel={b.identity.name}
          />
        </div>
      </section>

      {/* Trait by trait */}
      <section className="rounded-2xl border border-border bg-card/60 px-6 py-2">
        <div className="border-b border-border/60 py-3">
          <span className="eyebrow">{t.battle.traitsTitle}</span>
        </div>
        <div className="divide-y divide-border/60">
          {a.dna.map((d) => (
            <TraitRow
              key={d.category}
              label={t.dna.categories[d.category]}
              a={d.score}
              b={b.dna.find((x) => x.category === d.category)?.score ?? 0}
            />
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section className="rounded-2xl border border-border bg-card/60 px-6 py-2">
        <div className="border-b border-border/60 py-3">
          <span className="eyebrow">{t.battle.statsTitle}</span>
        </div>
        <div className="divide-y divide-border/60">
          {stats.map((s) => (
            <StatRow key={s.label} label={s.label} a={s.a} b={s.b} />
          ))}
        </div>
      </section>

      <Link
        href={`/analyze?repo=${a.identity.fullName}`}
        className="inline-block font-mono text-sm text-muted-foreground transition-colors hover:text-gold"
      >
        {t.battle.backToSingle.replace('{repo}', a.identity.name)}
      </Link>
    </div>
  );
}
