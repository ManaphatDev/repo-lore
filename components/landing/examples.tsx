'use client';

import Link from 'next/link';
import { ArrowUpRight, Star } from 'lucide-react';

import { EXAMPLE_REPOS } from '@/lib/examples';
import { cn } from '@/lib/utils';
import { useT } from '@/components/i18n/language-provider';
import { Reveal } from '@/components/reveal';

const ACCENT: Record<string, string> = {
  gold: 'text-gold border-gold/30',
  verdigris: 'text-verdigris border-verdigris/30',
  oxblood: 'text-oxblood border-oxblood/30',
};

export function Examples() {
  const t = useT();

  return (
    <section id="examples" className="border-b border-border/60 py-24">
      <div className="container">
        <Reveal>
          <header className="max-w-2xl">
            <span className="eyebrow">{t.examples.eyebrow}</span>
            <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {t.examples.title}
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              {t.examples.subtitle}
            </p>
          </header>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {EXAMPLE_REPOS.map((repo, i) => (
            <Reveal key={repo.slug} delay={i * 90} className="flex">
            <Link
              href={`/analyze?repo=${repo.slug}`}
              className="hover-lift group relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card/60 p-7"
            >
              <div
                className={cn(
                  'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs',
                  ACCENT[repo.accent],
                )}
              >
                {repo.language}
              </div>

              <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">
                <span className="text-muted-foreground">{repo.owner}/</span>
                {repo.name}
              </h3>

              <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                {repo.blurb}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5" />
                  {t.examples.cta}
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" />
              </div>
            </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
