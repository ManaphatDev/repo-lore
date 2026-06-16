'use client';

import { useT } from '@/components/i18n/language-provider';
import { Reveal } from '@/components/reveal';

const NUMS = ['01', '02', '03', '04'];

export function HowItWorks() {
  const t = useT();

  return (
    <section id="how" className="border-b border-border/60 py-24">
      <div className="container">
        <Reveal>
          <header className="max-w-2xl">
            <span className="eyebrow">{t.how.eyebrow}</span>
            <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {t.how.title}
            </h2>
          </header>
        </Reveal>

        <ol className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {t.how.steps.map((step, i) => (
            <li key={step.title} className="relative">
              <Reveal delay={i * 90}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-gold">
                  {NUMS[i] ?? `0${i + 1}`}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
              </div>
              <h3 className="mt-4 font-display text-xl font-medium tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
              <span className="mt-4 inline-block font-display text-6xl font-semibold leading-none text-foreground/[0.04]">
                {i + 1}
              </span>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
