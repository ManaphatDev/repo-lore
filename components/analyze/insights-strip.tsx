import {
  Activity,
  CalendarClock,
  Code2,
  GitBranch,
  GitPullRequest,
  History,
  Network,
  Star,
  Tag,
  Timer,
  Users,
  type LucideIcon,
} from 'lucide-react';

import type { RepoInsight } from '@/types/analysis';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  Activity,
  Users,
  Star,
  Code2,
  Tag,
  History,
  GitPullRequest,
  Timer,
  GitBranch,
  Network,
  CalendarClock,
};

const TONES: Record<RepoInsight['tone'], string> = {
  gold: 'text-gold border-gold/25 bg-gold/[0.06]',
  verdigris: 'text-verdigris border-verdigris/25 bg-verdigris/[0.06]',
  oxblood: 'text-oxblood border-oxblood/25 bg-oxblood/[0.06]',
  muted: 'text-muted-foreground border-border bg-background/40',
};

export function InsightsStrip({ insights }: { insights: RepoInsight[] }) {
  if (insights.length === 0) return null;
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight) => {
        const Icon = ICONS[insight.icon] ?? Activity;
        return (
          <div
            key={insight.title}
            className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4"
          >
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                TONES[insight.tone],
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                {insight.title}
              </p>
              <p className="mt-0.5 text-sm leading-snug text-foreground/90">
                {insight.detail}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
