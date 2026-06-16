'use client';

import * as React from 'react';
import {
  Archive,
  CalendarDays,
  Check,
  ExternalLink,
  GitFork,
  History,
  Link,
  Scale,
  Star,
  Tag,
  Users,
} from 'lucide-react';

import type { RepoAnalysis } from '@/types/analysis';
import { formatDate, formatNumber, humanDuration, relativeTime } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { useT, useI18n } from '@/components/i18n/language-provider';
import { ShareCard } from './share-card';

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/40 p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="font-mono text-[0.7rem] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function ShareButton() {
  const t = useT();
  const [copied, setCopied] = React.useState(false);

  function handleShare() {
    void navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-gold/40 hover:text-foreground"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-verdigris" />
      ) : (
        <Link className="h-3.5 w-3.5" />
      )}
      {copied ? t.overview.shareCopied : t.overview.share}
    </button>
  );
}

export function OverviewCard({ analysis }: { analysis: RepoAnalysis }) {
  const { identity: id, stats, maturity } = analysis;
  const { t, lang } = useI18n();

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card/60 shadow-codex">
      <div className="border-b border-border/60 bg-gradient-to-b from-gold/[0.06] to-transparent p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={id.ownerAvatar}
              alt={`${id.owner} avatar`}
              width={60}
              height={60}
              className="h-[60px] w-[60px] rounded-full border border-border"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                <a
                  href={id.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:text-gold"
                >
                  <span className="text-muted-foreground">{id.owner}/</span>
                  {id.name}
                  <ExternalLink className="h-4 w-4 opacity-50" />
                </a>
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="default">{t.maturity[maturity.stage]}</Badge>
                {id.language && (
                  <Badge variant="secondary">{id.language}</Badge>
                )}
                {id.archived && (
                  <Badge variant="oxblood">
                    <Archive className="h-3 w-3" /> {t.overview.archived}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton />
            <ShareCard slug={id.fullName} />
          </div>
        </div>

        {id.description && (
          <p className="mt-5 max-w-3xl text-pretty leading-relaxed text-foreground/85">
            {id.description}
          </p>
        )}

        {id.topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {id.topics.slice(0, 8).map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-background/40 px-2.5 py-0.5 font-mono text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> {t.overview.created}{' '}
            {formatDate(id.createdAt, lang)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <History className="h-3.5 w-3.5" /> {t.overview.updated}{' '}
            {relativeTime(id.pushedAt, lang)}
          </span>
          {id.license && (
            <span className="inline-flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" /> {id.license}
            </span>
          )}
          <span>· {humanDuration(id.ageDays, lang)}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 p-7 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile icon={Star} label={t.overview.stars} value={formatNumber(id.stars)} />
        <StatTile icon={GitFork} label={t.overview.forks} value={formatNumber(id.forks)} />
        <StatTile
          icon={Users}
          label={t.overview.contributors}
          value={`${formatNumber(stats.totalContributors)}${stats.totalContributors >= 100 ? '+' : ''}`}
        />
        <StatTile
          icon={Tag}
          label={t.overview.releases}
          value={formatNumber(stats.totalReleases)}
        />
        <StatTile
          icon={History}
          label={t.overview.commitsPerWeek}
          value={String(stats.commitsPerWeek)}
        />
        <StatTile
          icon={Archive}
          label={t.overview.openIssues}
          value={formatNumber(id.openIssues)}
        />
      </div>
    </section>
  );
}
