'use client';

import {
  Dna,
  GitGraph,
  Library,
  LineChart,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { useT } from '@/components/i18n/language-provider';
import { Reveal } from '@/components/reveal';

const ICONS: LucideIcon[] = [GitGraph, Dna, Library, Users, LineChart, ShieldCheck];

export function Features() {
  const t = useT();
  const [lead, ...rest] = t.features.items;
  const LeadIcon = ICONS[0] ?? GitGraph;

  return (
    <section id="features" className="border-b border-border/60 py-24">
      <div className="container">
        <Reveal>
          <header className="max-w-2xl">
            <span className="eyebrow">{t.features.eyebrow}</span>
            <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {t.features.title}
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              {t.features.subtitlePrefix}
              <em className="italic text-foreground">{t.features.subtitleWhat}</em>
              {t.features.subtitleMid}
              <em className="italic text-foreground">{t.features.subtitleStory}</em>
              {t.features.subtitleSuffix}
            </p>
          </header>
        </Reveal>

        {/* Lead feature — larger, opens the section like a chapter */}
        {lead && (
          <Reveal delay={100} className="mt-14">
            <div className="grid items-start gap-6 border-t border-border pt-10 md:grid-cols-[1.1fr_1fr] md:gap-12">
              <div className="flex items-start gap-4">
                <LeadIcon className="mt-1 h-7 w-7 shrink-0 text-gold" />
                <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  {lead.title}
                </h3>
              </div>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                {lead.body}
              </p>
            </div>
          </Reveal>
        )}

        {/* Supporting features — editorial two-column index, hairline-ruled */}
        <Reveal
          delay={160}
          stagger={80}
          className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2"
        >
          {rest.map((item, i) => {
            const Icon = ICONS[i + 1] ?? GitGraph;
            return (
              <div key={item.title} className="border-t border-border/60 pt-6">
                <div className="flex items-center gap-2.5">
                  <Icon className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-lg font-medium tracking-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-2.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
