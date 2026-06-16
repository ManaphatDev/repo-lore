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

        <Reveal delay={100} stagger={90} className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((item, i) => {
            const Icon = ICONS[i] ?? GitGraph;
            return (
              <div
                key={item.title}
                className="group relative bg-card/60 p-7 transition-colors hover:bg-card"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold/25 bg-gold/10 text-gold transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-medium tracking-tight">
                  {item.title}
                </h3>
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
