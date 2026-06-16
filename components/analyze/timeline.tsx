'use client';

import {
  MapPin,
  Milestone,
  Sprout,
  Tag,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import type { TimelineEvent, TimelineKind } from '@/types/analysis';
import { cn } from '@/lib/utils';
import { useT } from '@/components/i18n/language-provider';
import { SectionHeading } from './section-heading';

const KIND: Record<
  TimelineKind,
  { icon: LucideIcon; dot: string; ring: string; text: string }
> = {
  genesis: {
    icon: Sprout,
    dot: 'bg-gold',
    ring: 'ring-gold/30',
    text: 'text-gold',
  },
  release: {
    icon: Tag,
    dot: 'bg-gold',
    ring: 'ring-gold/30',
    text: 'text-gold',
  },
  milestone: {
    icon: Milestone,
    dot: 'bg-oxblood',
    ring: 'ring-oxblood/30',
    text: 'text-oxblood',
  },
  burst: {
    icon: Zap,
    dot: 'bg-verdigris',
    ring: 'ring-verdigris/30',
    text: 'text-verdigris',
  },
  community: {
    icon: Users,
    dot: 'bg-verdigris',
    ring: 'ring-verdigris/30',
    text: 'text-verdigris',
  },
  maintenance: {
    icon: Wrench,
    dot: 'bg-muted-foreground',
    ring: 'ring-border',
    text: 'text-muted-foreground',
  },
  present: {
    icon: MapPin,
    dot: 'bg-gold',
    ring: 'ring-gold/40',
    text: 'text-gold',
  },
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const t = useT();
  return (
    <section>
      <SectionHeading
        id="timeline"
        eyebrow={t.timelineSection.eyebrow}
        title={t.timelineSection.title}
        description={t.timelineSection.subtitle}
      />

      <ol className="relative mt-10 space-y-8 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-gradient-to-b before:from-gold/40 before:via-border before:to-transparent">
        {events.map((event, i) => {
          const k = KIND[event.kind];
          const Icon = k.icon;
          return (
            <li
              key={event.id}
              className="relative pl-12 animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 70, 500)}ms` }}
            >
              <span
                className={cn(
                  'absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-background ring-4',
                  k.ring,
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    k.text,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </span>

              <div className="rounded-xl border border-border bg-card/50 p-5 transition-colors hover:border-gold/30 hover:bg-card">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {event.label}
                  </span>
                  {event.meta && (
                    <span
                      className={cn(
                        'rounded-full border border-border px-2 py-0.5 font-mono text-[0.65rem]',
                        k.text,
                      )}
                    >
                      {event.meta}
                    </span>
                  )}
                </div>
                <h3 className="mt-1.5 font-display text-xl font-medium tracking-tight">
                  {event.title}
                </h3>
                <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
