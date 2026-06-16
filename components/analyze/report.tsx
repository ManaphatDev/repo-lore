'use client';

import * as React from 'react';
import { Info } from 'lucide-react';

import type { RepoAnalysis } from '@/types/analysis';
import { formatDate } from '@/lib/format';
import { addRecent } from '@/lib/recent';
import { Reveal } from '@/components/reveal';
import { useT, useI18n } from '@/components/i18n/language-provider';
import { OverviewCard } from './overview-card';
import { InsightsStrip } from './insights-strip';
import { LoreReader } from './lore-reader';
import { DnaPanel } from './dna-panel';
import { Timeline } from './timeline';
import { Contributors } from './contributors';
import { ChartsSection } from './charts/charts-section';
import { CompareInvite } from './compare-invite';
import { EmbedBadge } from './embed-badge';

function ReportNav() {
  const t = useT();
  const nav = [
    { href: '#lore', label: t.report.navLore },
    { href: '#dna', label: t.report.navDna },
    { href: '#timeline', label: t.report.navTimeline },
    { href: '#contributors', label: t.report.navCast },
  ];
  return (
    <nav className="sticky top-16 z-30 -mx-4 mb-2 flex gap-1 overflow-x-auto border-b border-border/60 bg-background/80 px-4 py-2.5 backdrop-blur-md">
      {nav.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="whitespace-nowrap rounded-full px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function ReportNotes({
  notes,
  generatedAt,
  aiAvailable,
}: {
  notes: string[];
  generatedAt: string;
  aiAvailable: boolean;
}) {
  const { t, lang } = useI18n();
  return (
    <div className="rounded-xl border border-border/70 bg-muted/30 p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Info className="h-4 w-4" />
        <span className="font-mono text-xs uppercase tracking-wider">
          {t.report.notesTitle}
        </span>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <li>{t.report.notesGenerated.replace('{date}', formatDate(generatedAt, lang))}</li>
        {notes.map((note) => (
          <li key={note}>· {note}</li>
        ))}
        <li>{aiAvailable ? t.report.notesEngineAi : t.report.notesEngine}</li>
      </ul>
    </div>
  );
}

export function Report({
  analysis,
  aiAvailable = false,
}: {
  analysis: RepoAnalysis;
  aiAvailable?: boolean;
}) {
  React.useEffect(() => {
    addRecent(analysis.identity.fullName);
  }, [analysis.identity.fullName]);

  return (
    <div>
      <ReportNav />
      <div className="space-y-16 pt-6">
        <Reveal>
          <OverviewCard analysis={analysis} />
        </Reveal>
        <Reveal>
          <InsightsStrip insights={analysis.insights} />
        </Reveal>
        <Reveal>
          <LoreReader analysis={analysis} aiAvailable={aiAvailable} />
        </Reveal>
        <Reveal>
          <DnaPanel analysis={analysis} />
        </Reveal>
        <Reveal>
          <Timeline events={analysis.timeline} />
        </Reveal>
        <Reveal>
          <ChartsSection charts={analysis.charts} />
        </Reveal>
        <Reveal>
          <Contributors contributors={analysis.contributors} />
        </Reveal>
        <Reveal className="grid gap-4 md:grid-cols-2">
          <CompareInvite repo={analysis.identity.fullName} />
          <EmbedBadge slug={analysis.identity.fullName} />
        </Reveal>
        <Reveal>
          <ReportNotes
            notes={analysis.notes}
            generatedAt={analysis.generatedAt}
            aiAvailable={aiAvailable}
          />
        </Reveal>
      </div>
    </div>
  );
}
