'use client';

import type { DnaScore, RepoAnalysis } from '@/types/analysis';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useT } from '@/components/i18n/language-provider';
import { SectionHeading } from './section-heading';
import { DnaRadar } from './charts/dna-radar';

function barTone(score: number): string {
  if (score >= 70) return 'bg-verdigris';
  if (score >= 45) return 'bg-gold';
  return 'bg-oxblood';
}

function ScoreRow({ dna }: { dna: DnaScore }) {
  const t = useT();
  return (
    <div className="py-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-lg font-medium tracking-tight">
          {t.dna.categories[dna.category]}
        </h3>
        <span className="font-mono text-sm tabular-nums text-foreground">
          {dna.score}
          <span className="text-muted-foreground">/100</span>
        </span>
      </div>
      <Progress
        value={dna.score}
        className="mt-2 h-1.5"
        indicatorClassName={cn(barTone(dna.score))}
      />
      <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
        {dna.explanation}
      </p>
    </div>
  );
}

export function DnaPanel({ analysis }: { analysis: RepoAnalysis }) {
  const t = useT();
  return (
    <section>
      <SectionHeading
        id="dna"
        eyebrow={t.dna.eyebrow}
        title={t.dna.title}
        description={t.dna.subtitle}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="eyebrow">{t.dna.constellation}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {t.maturity[analysis.maturity.stage]} · {analysis.maturity.index}
            </span>
          </div>
          <DnaRadar dna={analysis.dna} />
          <p className="mt-2 text-pretty text-sm text-muted-foreground">
            {analysis.maturity.summary}
          </p>
        </div>

        <div className="divide-y divide-border rounded-2xl border border-border bg-card/60 px-6">
          {analysis.dna.map((d) => (
            <ScoreRow key={d.category} dna={d} />
          ))}
        </div>
      </div>
    </section>
  );
}
