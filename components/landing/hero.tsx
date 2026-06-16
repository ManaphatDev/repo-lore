'use client';

import { GitBranch, ShieldCheck, Zap } from 'lucide-react';

import { RepoInput } from '@/components/repo-input';
import { RecentRepos } from '@/components/recent-repos';
import { useT } from '@/components/i18n/language-provider';

export function Hero() {
  const t = useT();

  const trust = [
    { icon: Zap, label: t.hero.trustRealtime },
    { icon: ShieldCheck, label: t.hero.trustNoLogin },
    { icon: GitBranch, label: t.hero.trustAnyRepo },
  ];

  return (
    <section
      id="try"
      className="relative overflow-hidden border-b border-border/60"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />

      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-[12%] top-[22%] h-1 w-1 animate-drift rounded-full bg-gold/60" />
        <span className="absolute left-[82%] top-[28%] h-1.5 w-1.5 animate-drift rounded-full bg-verdigris/50 [animation-delay:1.5s]" />
        <span className="absolute left-[70%] top-[64%] h-1 w-1 animate-drift rounded-full bg-gold/40 [animation-delay:0.8s]" />
        <span className="absolute left-[24%] top-[70%] h-1 w-1 animate-drift rounded-full bg-oxblood/40 [animation-delay:2.2s]" />
      </div>

      <div className="container relative flex flex-col items-center py-24 text-center md:py-32">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 font-mono text-xs tracking-wide text-gold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-gold" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
            </span>
            {t.hero.badge}
          </span>
        </div>

        <h1 className="mt-7 max-w-4xl text-balance font-display text-5xl font-semibold leading-[1.04] tracking-tight animate-fade-up [animation-delay:80ms] sm:text-6xl md:text-7xl">
          {t.hero.titleBefore}{' '}
          <em className="text-foil not-italic">{t.hero.titleHighlight}</em>.
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground animate-fade-up [animation-delay:160ms]">
          {t.hero.subtitle}
        </p>

        <div className="mt-10 w-full max-w-2xl animate-fade-up [animation-delay:240ms]">
          <RepoInput size="lg" showQuickPicks />
          <RecentRepos />
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 animate-fade-up [animation-delay:320ms]">
          {trust.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Icon className="h-4 w-4 text-gold/80" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
